const express = require("express");
const router = new express.Router();
const customError = require("../customError/CustomError");
const { user, job, application, system } = require("../models/Model");
const mongoose = require('mongoose');
const jwtAuthenticator = require("../middleware/JwtAuthentication");
// const validationMiddleware = require("../middleware/ValidationMiddleware.js");
const errorHandling = require("../middleware/ErrorHandling.js");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secreat = "this is your secreat";
router.use(cookieParser())


createtoken = (id) => {
    const token = jwt.sign({ id }, secreat, {
        expiresIn: 60 * 60 * 24
    });
    return token;
}

const getSystemObject = async () => {
    let systemObject = await system.findOne({ findMe: "me" });
    console.log(systemObject,"---")
    while (!systemObject) {
        const firstId = await system.create({});
        if (firstId) systemObject = await system.findOne({ findMe: "me" });
        else {
            console.log("error in creating first object");
            break;
        }
    }
    return systemObject;
}
// router.get("/test", async (req, res, next) => {
//     console.log("hooooooooooooooooo");
//     return res.send("hello")
// })
router.use(jwtAuthenticator);
router.post("/signup", /*validationMiddleware,*/ async (req, res, next) => {
    try {
        console.log("------signupreq------");
        console.log(req.body);
        const systemObject =await getSystemObject();
        if (!systemObject) res.send(202);
        const newUserId = systemObject.userIdCounter + 1;
        // console.log(systemObject,newUserId);
        const reqBody = { ...req.body, userId: newUserId };
        // console.log(reqBody);
        const createdUser = await user.create(reqBody);
        console.log(createdUser);
        if (createdUser) {
            const a=await system.updateOne({'_id':systemObject._id},{userIdCounter:newUserId});
            // console.log(newSystemObject,a);
            if(a.modifiedCount==1)res.status(200).json({ success: true });
        }
    }
    catch (error) {
        next(error);
    }
})

router.post("/signin", async (req, res, next) => {
    try {
        console.log("-------entered in sign in req------");
        const email = req.body.email;
        const password = req.body.password;
        const currentUser = await user.findOne({ email: email }).select('email password')
        // console.log(user);
        if (currentUser) {
            // console.log("user pass_authenticated");
            const passwordCheck = await bcrypt.compare(password, currentUser.password);
            if (passwordCheck) {
                // console.log("pass_authenticated");
                const token = createtoken(currentUser._id);
                res.cookie('user', token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
                return res.status(200).json({
                    success: true,
                })
            }
            else {
                // console.log("not pass_authenticated");
                throw new customError("wrong password", 404, "Password");
            }
        }
        else {
            throw new customError("Email not registered", 404, "Email");
        }
    }
    catch (error) {
        // console.log("enter in error block")
        console.log(error)
        next(error);
    }
})

// post job
// edit job
// delete job
// view job
// view jobs

// apply job/post application
// application delete
// application action
// view application
// view applications --

// edit user
// view user
// view users


router.post("/job", /*validationMiddleware,*/ async (req, res, next) => {
    try {
        console.log("-------postJobreqrecieved--------");
        // console.log(req.body);
        const reqBody = req.body;
        // console.log(reqBody)
        const systemObject = await getSystemObject();
        if (!systemObject) res.send(202);
        const newJobId = systemObject.jobIdCounter + 1;
        const currentUserId = reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        else if (currentUser && reqBody) {
            // console.log(reqBody);
            if (currentUser.userType !== "faculty") {
                throw new customError("u r not allowed to do this request", 403);
            }
            if (reqBody.startingDate > reqBody.endingDate) {
                throw new customError("ending date must not be before starting date", 400, "ending date");
            }
            if (reqBody.registrationStartingDate > reqBody.registrationEndingDate) {
                throw new customError("reginstration ending date must not be before registration starting date", 400, "registration ending date");
            }
            const now = Date.now();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const date = new Date(now + istOffset).toISOString();
            const newJob = {
                jobId: newJobId,
                postedBy: currentUser._id,
                heading: reqBody.heading,
                type: reqBody.type,
                description: reqBody.description,
                keywords: reqBody.keywords,
                startingDate: reqBody.startingDate,
                endingDate: reqBody.endingDate,
                registrationStartingDate: reqBody.registrationStartingDate,
                registrationEndingDate: reqBody.registrationEndingDate,
                status: "active",
                image: reqBody.image,
                location: reqBody.location,
                postDate: date
            }
            const createdJob = await job.create(newJob);
            if (createdJob) {
                const a=await system.updateOne({'_id':systemObject._id},{jobIdCounter:newJobId});
                // console.log(newSystemObject,a);
                if(a.modifiedCount==1)res.status(200).json({ success: true });
            }
        }
    }
    catch (error) {
        console.log(error);
        next(error)
    }
})

router.patch("/job/:jobId", /*validationMiddleware,*/  async (req, res, next) => {
    try {
        console.log("-------jobeditreqrecieved--------");
        // console.log(req.body);
        let reqBody = req.body;
        const jobId = req.params.jobId;
        // console.log(reqBody)
        const currentUserId = reqBody.user;
        delete reqBody.user;
        // reqBody['status'] = "pending";
        // console.log(reqBody)
        const currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        else if (currentUser && reqBody) {
            if (currentJob.postedBy != currentUserId) {
                throw new customError("you are not allowed for modifying this job!", 403)
            }
            if (reqBody.startingDate > reqBody.endingDate) {
                throw new customError("ending date must not be before starting date", 400, "ending date");
            }
            if (reqBody.registrationStartingDate > reqBody.registrationEndingDate) {
                throw new customError("reginstration ending date must not be before registration starting date", 400, "registration ending date");
            }
            // console.log(reqBody);
            
            const updatedJob = await job.findByIdAndUpdate(jobId, reqBody, { new: true });
            if (updatedJob) return res.status(200).json({
                success: true
            });
        }
    }
    catch (error) {
        console.log(error);
        next(error)
    }
})

router.delete("/job/:jobId", async (req, res, next) => {
    try {
        console.log("-------entered in delete req-------");
        const jobId = req.params.jobId;
        const currentUserId = req.body.user;
        const currentJob = await job.findOne({ '_id': jobId })
        if (!currentJob) {
            throw new customError("job not found!", 404)
        }
        if (currentJob.postedBy != currentUserId) {
            throw new customError("you are not allowed for delete this job!", 403)
        }
        const deletedJob = await job.deleteOne({ '_id': jobId });
        if (deletedJob) return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
})

router.get("/job/:jobId", async (req, res, next) => {
    try {
        console.log("------perticular job req recieved------");
        const currentUserId = req.body.user;
        const jobId = req.params.jobId;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect("/logout");
        else {
            const currentJob = await job.findOne({ '_id': jobId })
            if (!currentJob) {
                throw new customError("job not found", 404)
            }
            return res.status(200).send(currentJob);
        }
    }
    catch (err) {
        next(err);
    }
});

router.get("/job", async (req, res, next) => {
    try {
        console.log("-------alljob req recieved------");
        const currentUserId = req.body.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect('/logout');
        else {
            job.find({})
                .exec(function (err, jobs) {
                    if (err) {
                        throw (err);
                    }
                    else {
                        return res.status(200).send(jobs)
                    }
                })
        }
    }
    catch (err) {
        next(err);
    }
})

router.post("/application", /*validationMiddleware,*/  async (req, res, next) => {
    try {
        console.log("-------postapplicationreqrecieved--------");
        // console.log(req.body);
        const reqBody = req.body;
        // console.log(reqBody)
        const systemObject = await getSystemObject();
        if (!systemObject) res.send(202);
        const newApplicationId = systemObject.applicationIdCounter + 1;
        // const reqBody = { ...req.body, userId:newUserId };
        const currentUserId = reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        if (currentUser.userType !== "student") {
            throw new customError("you are not allowed for apply this job!", 403)
        }
        const currentJobId = reqBody.jobId;
        const currentJob = await job.findOne({ '_id': currentJobId })
        // console.log(currentUser);
        if (!currentJob){
            throw new customError("job not found", 404)
        }
        else if (currentUser && reqBody) {
            // console.log(reqBody);
            const now = Date.now();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const date = new Date(now + istOffset).toISOString();
            const newApplication = {
                applicantId: newApplicationId,
                jobId: reqBody.jobId,
                facultyId: reqBody.facultyId,
                status: "pending",
                applyDate: date
            }
            const createdApplication = await application.create(newApplication);
            if (createdApplication) {
                const a=await system.updateOne({'_id':systemObject._id},{applicationIdCounter:newApplicationId});
                // console.log(newSystemObject,a);
                if(a.modifiedCount==1)res.status(200).json({ success: true });
            };
        }
    }
    catch (error) {
        console.log(error);
        next(error)
    }
})

router.delete("/application/:applicationId", async (req, res, next) => {
    try {
        console.log("-------entered in application delete req-------");
        const applicationId = req.params.applicantionId;
        const currentUserId = req.body.user;
        const currentApplication = await application.findOne({ '_id': applicationId })
        if (!currentApplication) {
            throw new customError("Application not found!", 404)
        }
        const currentUser = await user.findOne({ '_id': currentUserId });
        if (!currentUser) res.redirect('/logout');
        if (!(currentApplication.applicantId == currentUserId || currentUser.userType == "admin")) {
            throw new customError("you are not allowed for delete this Application!", 403)
        }
        const deletedApplication = await application.deleteOne({ '_id': applicationId });
        if (deletedApplication) return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
})

router.patch("/application/:applicationId", async (req, res, next) => {
    try {
        console.log("-------application action--------");
        const currentUserId = req.body.user;
        const applicationId = req.params.applicationId;
        const currentUser = await user.findOne({ '_id': currentUserId })
        const currentApplication = await application.findOne({ '_id': applicationId })
        let reqBody = req.body;
        if (!currentUser) res.redirect("/logout");
        if (!currentApplication) {
            throw new customError("application not found", 404);
        }
        if (currentApplication.applicantId === currentUserId) {
            if(!(reqBody.status==="cancelled" || reqBody.status==="pending")){
            throw new customError("you are not allowed for this request!", 403)
        }}
        else if (currentApplication.facultyId === currentUserId) {
            if(!(reqBody.status==="rejected" || reqBody.status==="accepted")){
            throw new customError("you are not allowed for this request!", 403)
        }}
        else {
            delete reqBody.user;
            const modifiedApplication = { ...currentApplication._doc, ...reqBody };
            const updatedApplication = await application.findByIdAndUpdate(applicationId, modifiedApplication, { new: true });
            if (updatedApplication) return res.status(200).json({ success: true });
        }
    }
    catch (err) {
        // console.log(err);
        next(err);
    }
})

router.get("/application/:applicationId", async (req, res, next) => {
    try {
        console.log("------perticular application req recieved------");
        const currentUserId = req.body.user;
        const applicationId = req.params.applicationId;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect("/logout");
        else {
            const currentApplication = await application.findOne({ '_id': applicationId })
            if (!currentApplication) {
                throw new customError("job not found", 404)
            }
            else if(!(currentApplication.applicantId == currentUserId || currentApplication.facultyId== currentUserId || currentUser.userType==admin)) {
                throw new customError("you are not allowed for viewing this job!", 403)
            }
            return res.status(200).send(currentApplication);
        }
    }
    catch (err) {
        next(err);
    }
});

router.get("/application", async (req, res, next) => {
    try {
        console.log("-------allapplication req recieved------");
        let reqQuery = {}
        const currentUserId = req.body.user;
        const currentUser = await user.findOne({ '_id': currentUserId })

        if (currentUser.userType === "student") {
            reqQuery['applicantId'] = currentUser._id;
        }
        else if (currentUser.userType === "faculty") {
            reqQuery['facultyId'] = currentUser._id;
        }
        if (!currentUser) res.redirect('/logout');
        else {
            // console.log(reqQuery);
            application.find(reqQuery)
                .exec(function (err, applications) {
                    if (err) {
                        throw (err);
                    }
                    else {
                        return res.status(200).send(applications)
                    }
                })

        }
    }
    catch (err) {
        next(err);
    }
})

router.get("/user/:userId", async (req, res, next) => {
    try {
        console.log("--------perticular user req recieved--------");
        const currentUserId = req.body.user;
        const viewUserId = req.params.userId;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect("/logout");
        else {
            const viewUser = await user.findOne({ '_id': viewUserId }).select('-password')
            if (!viewUser) {
                throw new customError("user not found", 404);
            }
            else {
                return res.status(200).send(viewUser);
            }
        }
    }
    catch (err) {
        next(err);
    }
})

router.patch("/user", /*validationMiddleware,*/  async (req, res, next) => {
    try {
        console.log("--------edit myprofile req recieved--------");
        let reqBody = req.body;
        // console.log(reqBody)
        const currentUserId = reqBody.user;
        delete reqBody.user;
        let currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        if (currentUser._id !== currentUserId) {
            throw new customError("you are not allowed for modifying user details!", 403)
        }
        if (currentUser && reqBody) {
            for (let prop in reqBody) {
                currentUser[prop] = reqBody[prop];
            }
            // console.log(currentUser);
            const updatedUser = await user.findByIdAndUpdate(currentUser._id, currentUser, { new: true });
            // console.log(updatedUser);
            if (updatedUser) return res.status(200).json({
                success: true
            });
        }
    }
    catch (err) {
        next(err);
    }
})


router.get("/myself", async (req, res, next) => {
    try {
        console.log("--------myprofile req recieved--------");
        if (!req.body.hasOwnProperty("user")) {
            res.redirect("/logout");
        }
        else {
            console.log(req.body);
            const currentUserId = req.body.user;
            const currentUser = await user.findOne({ '_id': currentUserId }).select('-password')
            if (!currentUser) res.redirect("/logout");
            else return res.status(200).send(currentUser);
        }
    }
    catch (err) {
        next(err);
    }
})

router.get("/user", async (req, res, next) => {
    try {
        console.log("-------alluserreq------");
        const currentUserId = req.body.user;
        const currentUser = await user.findOne({ '_id': currentUserId })

        if (!currentUser) res.redirect('/logout');
        else if (currentUser.status !== "admin") {
            throw new customError("you are not allowed for this request!", 403);
        }
        else {
            user.find({})
                // .select('name email status userType contact')
                // .skip((pageNumber - 1) * pageSize)
                // .limit(pageSize)
                .exec(function (err, users, next) {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).send(users)
                    }
                })

        }
    }
    catch (err) {
        next(err);
    }
})

router.get("/logout", async (req, res) => {
    try {
        console.log("--------logout req recieved--------");
        return res
            .clearCookie("user")
            .status(200)
            .send("Successfully logged out");
    }
    catch (err) {
        res.status(401).send(err)
    }
})

router.use(errorHandling)

module.exports = router;
