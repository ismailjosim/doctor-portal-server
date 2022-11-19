require('dotenv').config();
require('colors');
const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// header: verifyJWT token function
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);

    if (!authHeader) {
        return res.status(401).send('Unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({
                message: "forbidden access"
            })
        }
        req.decoded = decoded
        next()

    })
}



const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@cluster0.s9x13go.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// section: Database connect Function
const dbConnect = async () => {
    try {
        await client.connect();
        console.log("Database Connected!");
    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect()



// todo Database Collection
const AppointmentCollection = client.db('doctorsPortal').collection('appointmentOptions');
const bookingsCollection = client.db('doctorsPortal').collection('bookings');
const usersCollection = client.db('doctorsPortal').collection('users');


// TODO run server
app.get('/', (req, res) => {
    res.send(`<div>Doctor Portal Server Connected 🎉</div>`)
})



// todo get all appointment options from database
app.get('/appOptions', async (req, res) => {
    try {
        const date = req.query.date;

        // use aggregate to query multiple collection and marge data.

        // Appointment query
        const optionsQuery = {};
        const options = await AppointmentCollection.find(optionsQuery).toArray();

        // booking query : get the booking of the providing date
        const bookingQuery = { appointmentDate: date }
        const prevBooked = await bookingsCollection.find(bookingQuery).toArray();

        // loop through option
        options.forEach(option => {
            const optionBooked = prevBooked.filter(book => book.treatmentName === option.name);
            const bookedSlots = optionBooked.map(book => book.slot);
            // console.log(option.name, bookedSlots);

            // show available slot based on date and return them
            const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
            // console.log(remainingSlots.length);
            option.slots = remainingSlots;

        })

        res.send({
            success: true,
            options: options
        })

    }
    catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// todo: Save appoint Bookings data to the database
app.post('/bookings', async (req, res) => {
    try {
        const booking = req.body;
        // console.log(booking);



        // 8. Limit one booking per user per treatment per day
        // step 01 : get appointment date from req
        const query = {
            appointmentDate: booking.appointmentDate,
            email: booking.email,
            treatmentName: booking.treatmentName
        }

        // step 02: already booked
        const alreadyBooked = await bookingsCollection.find(query).toArray();

        if (alreadyBooked.length) {
            const message = `You already have a booking on ${ booking.appointmentDate }`;
            return res.send({
                success: true,
                bookings: message
            })
        }

        const bookings = await bookingsCollection.insertOne(booking);
        res.send({
            success: true,
            bookings: bookings
        })

    } catch (error) {
        res.send({
            success: false,
            options: options

        })
    }
})


// todo: Get all bookings data for specific user based on email
app.get('/bookings', verifyJWT, async (req, res) => {
    try {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;

        // header: jwt token get from booking headers
        if (email !== decodedEmail) {
            res.status(403).send({ message: 'forbidden access' })
        }

        const query = { email: email }
        const bookings = await bookingsCollection.find(query).toArray();


        res.send({
            success: true,
            bookings: bookings
        })
    } catch (error) {
        res.send({
            success: false,
            options: options
        })
    }
})

// todo => Save user info from Client Side
app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        // console.log(user);

        const users = await usersCollection.insertOne(user)
        res.send({
            success: true,
            users: users
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// Header: JWT Token To verify User
app.get('/jwt', async (req, res) => {
    try {
        const email = req.query.email;
        const query = { email: email };

        const user = await usersCollection.findOne(query);

        if (user) {
            const token = jwt.sign({ email }, process.env.JWT_TOKEN_SECRET, { expiresIn: '1d' })

            return res.send({
                success: true,
                token: token
            })
        }

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// header: get all users data
app.get('/users', async (req, res) => {
    const query = {}
    const users = await usersCollection.find(query).toArray();
    res.send({
        success: true,
        users: users
    })
})


// listen app
app.listen(port, () => console.log(`Server Running on Port ${ port }`.random.bold))
