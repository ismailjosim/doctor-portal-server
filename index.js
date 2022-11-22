require('dotenv').config();
require('colors');
const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// HEADER: STRIPE Payment Require
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);





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
const doctorCollection = client.db('doctorsPortal').collection('doctors');
const paymentsCollection = client.db('doctorsPortal').collection('payments');




// header: Make sure to use verify admin after verifyJWT
const verifyAdmin = async (req, res, next) => {
    try {
        const decodedEmail = req.decoded.email;

        const query = { email: decodedEmail }
        const user = await usersCollection.findOne(query);

        if (user?.role !== 'admin') {
            return res.status(403).send({ message: "Forbidden access" })
        }
        next()

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
}





// TODO: General server Checking
app.get('/', (req, res) => {
    res.send(`<div>Doctor Portal Server Connected 🎉</div>`)
})



// TODO: get all appointment options from database
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
            error: error.message
        })

    }
})

// TODO: GET BOOKING ID
app.get('/booking/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const booking = await bookingsCollection.findOne(query);

        res.send({
            success: true,
            booking: booking
        })

    } catch (error) {
        res.send({
            success: false,
            options: options

        })
    }
})

// Section: create payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const booking = req.body;
        const price = booking.price;

        const amount = price * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: amount,
            "payment_method_types": [
                "card"
            ]

        })
        res.send({
            clientSecret: paymentIntent.client_secret,
        });


    } catch (error) {
        res.send({
            success: false,
            error: error.message

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
    try {

        const query = {}
        const users = await usersCollection.find(query).toArray();
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


// header: update user details forbid user to access admin panel if the user isn't admin
app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {

    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                role: 'admin'
            }
        }
        const admin = await usersCollection.updateOne(filter, updateDoc, options)

        res.send({
            success: true,
            admin: admin
        })


    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// TODO: Add new Price elment to ===> Database =>
// app.get('/addPrice', async (req, res) => {
//     const filter = {}
//     const options = { upsert: true }
//     const updateDoc = {
//         $set: {
//             price: 500
//         }
//     }
//     const result = await AppointmentCollection.updateMany(filter, updateDoc, options);
//     res.send(result)
// })



// Link: Prevent accessing Admin route via URL
app.get('/users/admin/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const query = { email }
        const user = await usersCollection.findOne(query);

        res.send({ isAdmin: user?.role === 'admin' });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }

})

// Link: Prevent accessing Admin route via URL
app.get('/appointmentSpecialty', async (req, res) => {
    try {
        const query = {}
        const specialty = await AppointmentCollection.find(query).project({ name: 1 }).toArray()
        res.send({
            success: true,
            specialty: specialty

        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// todo: save doctor info to database
app.post('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
    try {
        const doctor = req.body;
        const doctors = await doctorCollection.insertOne(doctor)

        res.send({
            success: true,
            doctors: doctors

        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
    try {
        const query = {};
        const doctors = await doctorCollection.find(query).toArray()

        res.send({
            success: true,
            doctors: doctors

        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.delete('/doctors/:id', verifyJWT, verifyAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const doctor = await doctorCollection.deleteOne(query);

        res.send({
            success: true,
            doctor: doctor
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Header: payment
app.post('/payments', async (req, res) => {
    try {
        const query = req.body
        const result = await paymentsCollection.insertOne(query)
        const id = query.bookingId;

        const filter = { _id: ObjectId(id) }

        const updateDoc = {
            $set: {
                paid: true,
                transactionId: query.transactionId
            }
        }

        const updateResult = await bookingsCollection.updateOne(filter, updateDoc)

        res.send({
            success: true,
            payment: result,
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})






// listen app
app.listen(port, () => console.log(`Server Running on Port ${ port }`.random.bold))
