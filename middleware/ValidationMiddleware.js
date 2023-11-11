const nonEmptyStringRegex = /^.+$/;
const emailRegex = /^\w+([\.-]?\w+)*@nitc\.ac\.in$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}/;
const now = Date.now();
const istOffset = 5.5 * 60 * 60 * 1000;
const date = new Date(now + istOffset).toISOString();
const validationMiddleware = async (req, res, next) => {
    console.log("-------entered in validation middleware---------");
    let errors = {};
    if ("name" in req.body && (!nonEmptyStringRegex.test(req.body.name))) {
        errors["name"] = "invalid name";
    }
    if ("email" in req.body && (!emailRegex.test(req.body.email))) {
        errors["email"] = "invalid email";
    }
    if ("password" in req.body && (!passwordRegex.test(req.body.password))) {
        errors["password"] = "invalid password";
    }
    if ("userType" in req.body && (!(["faculty", "student", "admin"].includes(req.body.userType)))) {
        errors["userType"] = "invalid user type"
    }
    if ("personId" in req.body && (!(nonEmptyStringRegex.test(req.body.personId)))) {
        errors["personId"] = "invalid person id"
    }
    if ("contact" in req.body && (req.body.contact < 1000000000 || req.body.contact > 9999999999)) {
        errors["contact"] = "invalid contact"
    }
    if ("program" in req.body && (!(["M.Tech", "B.Tech"].includes(req.body.program)))) {
        errors["hostel"] = "invalid program"
    }
    if ("semester" in req.body && (req.body.semester<1 && req.body.semester>8)) {
        errors["hostel"] = "invalid program"
    }
    // if ("department" in req.body && (!(["CSE", "ECE","CE","ME"].includes(req.body.program)))) {
    //     errors["hostel"] = "invalid program"
    // }

    // if ("dateOfBirth" in req.body && ((!(nonEmptyStringRegex.test(req.body.dateOfBirth))) || (req.body.dateOfBirth.substring(1, 10) > new Date().toISOString().substring(1, 10)))) {
    //     errors["dateOfBirth"] = "invalid date of birth"
    // }
    if ("gender" in req.body && (!(["Male", "Female","other"].includes(req.body.gender)))) {
        errors["gender"] = "invalid gender"
    }


    //job validations------------------


    if ("startingDate" in req.body && (!(dateRegex.test(req.body.startingDate)))){
        errors["startingDate"] = "invalid starting date"
    }
    if ("endingDate" in req.body && (!(dateRegex.test(req.body.endingDate)))){
        errors["endingDate"] = "invalid ending date"
    }
    // else if("endingDate" in req.body &&)
    if ("registrationStartingDate" in req.body && (!(dateRegex.test(req.body.registrationStartingDate)))){
        errors["registrationStartingDate"] = "invalid registration starting date"
    }
    if ("registrationEndingDate" in req.body && (!(dateRegex.test(req.body.registrationStartingDate)))){
        errors["registrationEndingDate"] = "invalid registration ending date"
    }


    if ("heading" in req.body && (!(nonEmptyStringRegex.test(req.body.heading)))) {
        errors["heading"] = "invalid job heading"
    }
    if ("type" in req.body && (!(nonEmptyStringRegex.test(req.body.type)))) {
        errors["personId"] = "invalid job type"
    }
    if ("description" in req.body && (!(nonEmptyStringRegex.test(req.body.description)))) {
        errors["description"] = "invalid description"
    }
    // keywords:{

    // },
    // image:{

    // },
    // location:{

    // }

    if (req.path.includes('job')) {
        if (req.body.startingDate > req.body.endingDate) {
            errors["endingDate"] = "ending date must not be before starting date"
            // throw new customError("ending date must not be before starting date", 400, "ending date");
        }
        if (req.body.registrationStartingDate > req.body.registrationEndingDate) {
            errors["registrationEndingDate"] = "reginstration ending date must not be before registration starting date"
            // throw new customError("reginstration ending date must not be before registration starting date", 400, "registration ending date");
        }
        if (req.body.registrationStartingDate > req.body.startingDate) {
            errors["registrationStartingDate"]="reginstration starting date can'nt be after job starting date"
            // throw new customError("reginstration starting date can'nt be after job starting date", 400, "registration ending date");
        }
        if (req.body.registrationEndingDate>req.body.endingDate) {
            errors["registrationEndingDate"]="reginstration ending date can'nt be after job ending date"
            // throw new customError("reginstration starting date can'nt be a past date", 400, "registration starting date");
        }
    }


    if (Object.keys(errors).length !== 0) {
        return res.status(400).send({ ...errors, validationError: true });
    }
    next();
};

module.exports = validationMiddleware
