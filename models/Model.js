const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { default: isEmail } = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
    _id: {
        type:String,
        required: [true, 'error in generating user _id']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'please enter an email'],
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
            isAsync: false
        }
    },
    contact: {
        type: Number,
        required: [true, 'Please enter contact'],
        unique: true,
        validate: {
            validator: function (value) {
                if (value < 1000000000 || value > 9999999999) {
                    throw new mongoose.Error.ValidationError(this, {
                        message: 'Invalid mobile number',
                        path: 'contact'
                    });
                }
            }
        }
    },
    password: {
        type: String,
        required: [true, 'please enter password'],
        validate: {
            validator: function (value) {
                if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(value))) {
                    throw new mongoose.Error.ValidationError(this, {
                        message: "enter strong password",
                        path: 'password'
                    })
                }
            }
        }
    },
    userType: {
        type: String,
        required: [true, 'please select your user type']
    },
    name: {
        type: String,
        required: [true, 'please enter your name']
    },
    personId: {
        type: String,
        required: [true, 'please enter id']
    },
    department: {
        type: String,
        default: ""
        // required: [true,'please enter your department']
    },
    semester: {
        type: Number,
        default: ""
        // required: [true,'please enter your department']
    },
    program: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    }
})

const jobSchema = new mongoose.Schema({
    _id: {
        type:String,
        required: [true, 'error in generating job _id']
    },
    facultyId:{
        type:String,
        required: [true, 'error in generating job _id']
    },
    facultyName:{
        type:String,
        required: [true, 'error in generating job _id']
    },
    heading:{
        type: String,
        require: [true,"please enter heading of the job"]
    },
    type:{
        type: String,
        require: [true,"please enter heading of the job"]
    },
    description:{
        type:String,
    },
    keywords:{

    },
    startingDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    },
    endingDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    },
    registrationStartingDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    },
    registrationEndingDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    },
    postDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    },
    status:{
        type:String,
        default: "active"
    },
    image:{
        type:String,
        default: ""
    },
    location:{
        type:String,
        default: ""
    },
    applicant:{
        type:Number,
        default:0
    }
})

const applicationSchema = new mongoose.Schema({
    _id: {
        type:String,
        required: [true, 'error in generating application _id']
    },
    studentId:{
        type:String,
        required: [true, 'student id is not appended in application']
    },
    jobId:{
        type:String,
        required: [true, 'job id is not appended in application']
    },
    facultyId:{
        type:String,
        required: [true, 'faculty id is not appended in application']
    },
    status:{
        type:String,
        required:[true, "status not appended in application"]
    },
    applyDate:{
        type: Date,
        require: [true,"please enter heading of the job"]
    }
})

// const systemSchema = new mongoose.Schema({
//     findMe:{
//         type:String,
//         default:"me"
//     },
//     jobIdCounter:{
//         type:Number,
//         default:0
//     },
//     userIdCounter:{
//         type:Number,
//         default:0
//     },
//     applicationIdCounter:{
//         type:Number,
//         default:0
//     }
// })

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

const user = new mongoose.model("USER", userSchema)
const job = new mongoose.model("JOB", jobSchema)
const application = new mongoose.model("APPLICATION", applicationSchema)
// const system = new mongoose.model("SYSTEM", systemSchema)
module.exports = { user, job, application }