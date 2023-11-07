const nonEmptyStringRegex = /^.+$/;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}/;
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
    if ("program" in req.body && (!(["MTech", "BTech"].includes(req.body.program)))) {
        errors["hostel"] = "invalid program"
    }
    // if ("dateOfBirth" in req.body && ((!(nonEmptyStringRegex.test(req.body.dateOfBirth))) || (req.body.dateOfBirth.substring(1, 10) > new Date().toISOString().substring(1, 10)))) {
    //     errors["dateOfBirth"] = "invalid date of birth"
    // }
    if ("gender" in req.body && (!(["Male", "Female","other"].includes(req.body.gender)))) {
        errors["gender"] = "invalid gender"
    }
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
    if ("registrationStartingDate" in req.body && (!(dateRegex.test(req.body.registrationStartingDate)))){
        errors["registrationStartingDate"] = "invalid registration starting date"
    }
    if ("endingDate" in req.body && (!(dateRegex.test(req.body.endingDate)))){
        errors["endingDate"] = "invalid ending date"
    }
    if ("startingDate" in req.body && (!(dateRegex.test(startingDate)))){
        errors["startingDate"] = "invalid starting date"
    }
    if ("startingDate" in req.body && (!(nonEmptyStringRegex.test(req.body.startingDate)))) {
        errors["startingDate"] = "invalid starting date"
    }
    if ("exitDate" in req.body && ((!(nonEmptyStringRegex.test(req.body.exitDate))) || (req.body.exitDate < new Date().toISOString().substring(1, 10)))) {
        errors["exitDate"] = "invalid exit date"
    }
    if ("admissionDate" in req.body && ((!(nonEmptyStringRegex.test(req.body.admissionDate))) || (req.body.admissionDate.substring(1, 10) > new Date().toISOString().substring(1, 10)))) {
        errors["admissionDate"] = "invalid admission Date"
    }
    if (Object.keys(errors).length !== 0) {
        return res.status(400).send({ ...errors, validationError: true });
    }
    next();
};

module.exports = validationMiddleware
