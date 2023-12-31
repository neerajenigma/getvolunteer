const express = require("express");
const router = new express.Router();
const customError = require("../customError/CustomError");
const { user, job, application } = require("../models/Model");
const mongoose = require('mongoose');
const jwtAuthenticator = require("../middleware/JwtAuthentication");
const validationMiddleware = require("../middleware/ValidationMiddleware.js");
const errorHandling = require("../middleware/ErrorHandling.js");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secreat = "this is your secreat";
router.use(cookieParser())

const generateUserID = () => {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number

    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const userID = randomNum.toString(); // Convert the number to a string
    return userID;
}

const generateJobID = () => {
    const min = 10000000; // Minimum 6-digit number
    const max = 99999999; // Maximum 6-digit number

    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    const jobID = randomNum.toString(); // Convert the number to a string

    return jobID;
}

createtoken = (id) => {
    const token = jwt.sign({ id }, secreat, {
        expiresIn: 60 * 60 * 24
    });
    return token;
}

// const getSystemObject = async () => {
//     let systemObject = await system.findOne({ findMe: "me" });
//     console.log(systemObject,"---")
//     while (!systemObject) {
//         const firstId = await system.create({});
//         if (firstId) systemObject = await system.findOne({ findMe: "me" });
//         else {
//             console.log("error in creating first object");
//             break;
//         }
//     }
//     return systemObject;
// }
// router.get("/test", async (req, res, next) => {
//     console.log("hooooooooooooooooo");
//     return res.send("hello")
// })
router.use(jwtAuthenticator);
router.post("/signup", validationMiddleware, async (req, res, next) => {
    try {
        console.log("------signupreq------");
        console.log(req.body);
        // const systemObject =await getSystemObject();
        // if (!systemObject) res.send(202);
        let newUserId = generateUserID();
        while (true) {
            const exist = await user.findOne({ '_id': newUserId });
            if (exist) {
                newUserId = generateUserID();
            }
            else break;
        }
        // const newUserId = systemObject.userIdCounter + 1;
        // console.log(systemObject,newUserId);
        const reqBody = { ...req.body, _id: newUserId };
        // console.log(reqBody);
        if (reqBody.userType === "admin") {
            throw new customError("admin not allowed to do this request", 403);
        }
        const createdUser = await user.create(reqBody);
        console.log(createdUser);
        if (createdUser) {
            // const a=await system.updateOne({'_id':systemObject._id},{userIdCounter:newUserId});
            // console.log(newSystemObject,a);
            // if(a.modifiedCount==1)
            res.status(200).json({ success: true });
        }
    }
    catch (error) {
        next(error);
    }
})

router.post("/signin", validationMiddleware, async (req, res, next) => {
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


router.post("/job", validationMiddleware, async (req, res, next) => {
    try {
        console.log("-------postJobreqrecieved--------");
        // console.log(req.body);
        const reqBody = req.body;
        // console.log(reqBody)
        // const systemObject = await getSystemObject();
        // if (!systemObject) res.send(202);
        // const newJobId = systemObject.jobIdCounter + 1;
        let newJobId = generateJobID();
        while (true) {
            const exist = await user.findOne({ '_id': newJobId });
            if (exist) {
                newJobId = generateJobID();
            }
            else break;
        }
        const currentUserId = reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        else if (currentUser && reqBody) {
            // console.log(reqBody);
            const now = Date.now();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const date = new Date(now + istOffset).toISOString();
            if (currentUser.userType !== "faculty") {
                throw new customError("u r not allowed to do this request", 403);
            }
            // if (req.body.registrationStartingDate<date.substring(0, 10)) {
            //     // errors["registrationStartingDate"]="reginstration starting date can'nt be a past date"
            //     // throw new customError("reginstration starting date can'nt be a past date", 400, "registration starting date");
            // }
            const newJob = {
                _id: newJobId,
                facultyId: currentUser._id,
                facultyName: currentUser.name,
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
            // console.log(newJob)
            const createdJob = await job.create(newJob);
            if (createdJob) {
                // const a=await system.updateOne({'_id':systemObject._id},{jobIdCounter:newJobId});
                // console.log(newSystemObject,a);
                // if(a.modifiedCount==1)
                res.status(200).json({
                    success: true,
                    jobId: createdJob._id
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        next(error)
    }
})

router.patch("/job/:jobId", validationMiddleware, async (req, res, next) => {
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
        const currentJob = await job.findOne({ '_id': jobId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        else if (currentUser && reqBody) {
            if (currentJob.facultyId != currentUserId && currentUser.userType!=="admin") {
                throw new customError("you are not allowed for modifying this job!", 403)
            }

            const updatedJob = await job.findByIdAndUpdate(jobId,{...currentJob,status:reqBody.status}, { new: true });
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
        if (currentJob.facultyId != currentUserId) {
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
            if(currentJob.status==="inactive"){
                throw new customError("job has been blocked by admin", 403)
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
        let reqQuery = {}
        if (req.body.user) {
            const currentUserId = req.body.user;
            const currentUser = await user.findOne({ '_id': currentUserId })
            if (!currentUser) res.redirect('/logout');
            // console.log(currentUserId)
            if (currentUser.userType == "faculty") {
                reqQuery["facultyId"] = currentUserId;
            }
            if(currentUser.userType!=="admin"){
                reqQuery["status"]="active";
            }
        }
        if (1) {
            job.find(reqQuery)
                .exec()
                .then(jobs => {
                    return res.status(200).send(jobs)
                })
                .catch(err => {
                    throw (err);
                })
        }
    }
    catch (err) {
        next(err);
    }
})

router.post("/application", async (req, res, next) => {
    try {
        console.log("-------postapplicationreqrecieved--------");
        console.log(req.body);
        const reqBody = await req.body;
        console.log(reqBody)
        // const systemObject = await getSystemObject();
        // if (!systemObject) res.send(202);
        // const newApplicationId = systemObject.applicationIdCounter + 1;
        // const reqBody = { ...req.body, userId:newUserId };

        const currentUserId = reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
        if (currentUser.userType !== "student") {
            throw new customError("you are not allowed for apply this job!", 403)
        }
        const currentJobId = reqBody.jobId;
        console.log(reqBody)
        const currentJob = await job.findOne({ '_id': currentJobId })
        // console.log(currentUser);
        if (!currentJob) {
            throw new customError("job not found", 404)
        }
        if (currentJob.status==="inactive") {
            throw new customError("job has been blocked by admin", 403)
        }
        const pastApplication = await application.findOne({ studentId: currentUserId, jobId: currentJobId });
        if (pastApplication) {
            throw new customError("you are not allowed for apply more then once for any job!", 403)
        }

        let newApplicationId = generateJobID();
        while (true) {
            const exist = await user.findOne({ '_id': newApplicationId });
            if (exist) {
                newApplicationId = generateJobID();
            }
            else break;
        }
        if (currentUser && reqBody && currentJob) {
            // console.log(reqBody);
            const now = Date.now();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const date = new Date(now + istOffset).toISOString();
            if ((currentJob.registrationEndingDate.toISOString().substring(0, 10) < new Date().toISOString().substring(0, 10))) {
                throw new customError("you can't apply after registration ending date", 403);
            }
            const newApplication = {
                _id: newApplicationId,
                jobId: reqBody.jobId,
                facultyId: currentJob.facultyId,
                studentId: currentUserId,
                status: "pending",
                applyDate: date
            }
            const createdApplication = await application.create(newApplication);
            if (createdApplication) {
                const updJob = { ...currentJob._doc, applicant: currentJob.applicant + 1 }
                console.log(updJob)
                const updatedJob = await job.findByIdAndUpdate(currentJobId, updJob, { new: true });
                if (updatedJob) return res.status(200).json({
                    success: true
                });
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
        const applicationId = req.params.applicationId;
        const currentUserId = req.body.user;
        // console.log(applicationId,currentUserId)
        const currentApplication = await application.findOne({ '_id': applicationId })
        if (!currentApplication) {
            throw new customError("Application not found!", 404)
        }
        const currentUser = await user.findOne({ '_id': currentUserId });
        if (!currentUser) res.redirect('/logout');
        if (!(currentApplication.studentId == currentUserId || currentUser.userType == "admin")) {
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
        let currentJob = null;
        console.log(req.body);
        if (!currentUser) res.redirect("/logout");
        if (!currentApplication) {
            throw new customError("application not found", 404);
        }
        if (currentApplication.studentId === currentUserId) {
            if (reqBody.hasOwnProperty('status') && !(reqBody.status === "withdrawn" || reqBody.status === "pending")) {
                throw new customError("you are not allowed for this request!", 403)
            }
        }
        else if (currentApplication.facultyId === currentUserId) {
            if (reqBody.hasOwnProperty('status') && !(reqBody.status === "rejected" || reqBody.status === "accepted")) {
                throw new customError("you are not allowed for this request!", 403)
            }
        }
        else if (currentUser.userType !== "admin") {
            throw new customError("you are not allowed for this request!", 403)
        }
        if (reqBody.hasOwnProperty('notification') && (reqBody.notification == false) && currentApplication.studentId !== currentUserId) {
            throw new customError("you are not allowed for this request!", 403)
        }
        const decreaseCount = (currentUser.userType === "student" && reqBody.status == "withdrawn" && currentApplication.status !== "withdrawn") ? true : false
        if (reqBody) {
            delete reqBody.user;
            const modifiedApplication = { ...currentApplication._doc, ...reqBody };
            const updatedApplication = await application.findByIdAndUpdate(applicationId, modifiedApplication, { new: true });
            if (updatedApplication) {
                // console.log("count updated-----", decreaseCount)
                if (decreaseCount) {
                    // console.log("count update-----", updatedApplication.jobId)
                    try {
                        currentJob = await job.findOne({ '_id': updatedApplication.jobId })
                        // const a= currentJob()
                        // console.log(currentJob._doc);
                    }
                    catch (error) {
                        console.log(error)
                    }
                    if (!currentJob) {
                        return res.status(200).json({
                            success: true
                        });
                    }
                    const updJob = { ...currentJob._doc, applicant: currentJob.applicant - 1 }
                    // console.log(updJob)
                    const updatedJob = await job.findByIdAndUpdate(updatedApplication.jobId, updJob, { new: true });
                    if (updatedJob) {
                        // console.log("count updated-----")
                        return res.status(200).json({
                            success: true
                        });
                    }
                    else {
                        throw ("job withdrawl but applied count is not updated", 500)
                    }
                }
                else {
                    return res.status(200).json({
                        success: true
                    });
                }
            }
            else {
                throw ("job withdrawl failed", 500)
            }
        }
    }
    catch (err) {
        // console.log(err);
        next(err);
    }
})

// router.get("/application/:applicationId", async (req, res, next) => {
//     try {
//         console.log("------perticular application req recieved------");
//         const currentUserId = req.body.user;
//         const applicationId = req.params.applicationId;
//         const currentUser = await user.findOne({ '_id': currentUserId })
//         if (!currentUser) res.redirect("/logout");
//         else {
//             const currentApplication = await application.findOne({ '_id': applicationId })
//             if (!currentApplication) {
//                 throw new customError("job not found", 404)
//             }
//             else if(!(currentApplication.studentId == currentUserId || currentApplication.facultyId== currentUserId || currentUser.userType==admin)) {
//                 throw new customError("you are not allowed for viewing this job!", 403)
//             }
//             return res.status(200).send(currentApplication);
//         }
//     }
//     catch (err) {
//         next(err);
//     }
// });

// router.get("/application?:jobId", async (req, res, next) => {
//     try {
//         console.log("-------allapplication req recieved------");
//         let reqQuery = {}
//         let reqBody=req.body;
//         const jobId = req.params.jobId;
//         let currentUserId = reqBody.user;
//         // delete reqBody.user;
//         const currentUser = await user.findOne({ '_id': currentUserId })
//         if (currentUser.userType === "student") {
//             reqQuery['studentId'] = currentUser._id;
//         }
//         else if (currentUser.userType === "faculty") {
//             reqQuery['facultyId'] = currentUser._id;
//         }
//         reqQuery['jobId']=jobId;
//         if (!currentUser) res.redirect('/logout');
//         else {
//             // console.log(reqQuery);
//             application.find(reqQuery)
//                 .exec()
//                 .then(applications=> {
//                     return res.status(200).send(applications)        
//                 })
//                 .catch(err=>{
//                     throw (err);
//                 })

//         }
//     }
//     catch (err) {
//         next(err);
//     }
// })

router.get("/application_faculty/:jobId", async (req, res, next) => {
    try {
        console.log("-------allapplication req recieved------");
        let reqQuery = {}
        let reqBody = req.body;
        const jobId = req.params.jobId;
        let currentUserId = reqBody.user;
        // delete reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect('/logout');
        if (currentUser.userType === "student") {
            reqQuery['studentId'] = currentUser._id;
        }
        else if (currentUser.userType === "faculty") {
            reqQuery['facultyId'] = currentUser._id;
        }
        reqQuery['jobId'] = jobId;
        const applications = await application.find(reqQuery).exec().then(applications => {
            return applications
        })
            .catch(err => {
                throw (err);
            })
        const users = await user.find({}).select('name gender program branch semester _id')
        if (!users) {
            throw new customError("error in fetching users", 404);
        }
        let returnData = [];


        if (applications && users) {
            // console.log(applications)
            // console.log(users)
            for (const a in applications) {
                for (const b in users) {
                    if (users[b]._id === applications[a].studentId) {
                        console.log(applications[a], users[b])
                        newd = {
                            status: applications[a].status,
                            applicationId: applications[a]._id,
                            jobId: applications[a].jobId,
                            studentId: users[a]._id,
                            facultyId: applications[a].facultyId,
                            name: users[a].name,
                            gender: users[a].gender,
                            program: users[a].program,
                            branch: users[a].branch,
                            semester: users[a].semester
                        }
                        console.log(newd)
                        returnData.push(newd)
                    }
                }
            }
        }
        // console.log(returnData)
        return res.status(200).send(returnData)

    }
    catch (err) {
        next(err);
    }
})

router.get("/application_student", async (req, res, next) => {
    try {
        console.log("-------allapplication req recieved------");
        let reqQuery = {}
        let reqBody = req.body;
        let currentUserId = reqBody.user;
        // delete reqBody.user;
        const currentUser = await user.findOne({ '_id': currentUserId })
        if (!currentUser) res.redirect('/logout');
        if (currentUser.userType === "student") {
            reqQuery['studentId'] = currentUser._id;
        }
        else {
            throw new customError("you are not allowed for viewing this job!", 403)
        }
        const applications = await application.find(reqQuery).exec().then(applications => {
            return applications
        })
            .catch(err => {
                throw (err);
            })
        const jobs = await job.find({})
        if (!jobs) {
            throw new customError("error in fetching users", 404);
        }
        let returnData = [];

        if (applications && jobs) {
            // console.log(applications)
            // console.log(users)
            for (const a in applications) {
                for (const b in jobs) {
                    if (jobs[b]._id === applications[a].jobId && job[b].status==="active") {
                        console.log(applications[a], jobs[b])
                        returnData.push({ ...jobs[b]._doc, applicationStatus: applications[a].status, applicationId: applications[a]._id, notification: applications[a].notification, notificationValue: applications[a].notificationValue })
                    }
                }
            }
        }
        // console.log(returnData)
        return res.status(200).send(returnData)

    }
    catch (err) {
        next(err);
    }
})

router.get("/application/applied/:jobId", async (req, res, next) => {
    try {
        console.log("-------count application req recieved------");
        let reqQuery = { jobId: req.params.jobId }
        const currentUserId = req.body.user;
        const currentUser = await user.findOne({ '_id': currentUserId })

        if (currentUser) reqQuery['studentId'] = currentUser._id;
        // }
        if (!currentUser) res.redirect('/logout');
        else {
            // console.log(reqQuery);
            // const countr=application.find(reqQuery).count()
            const countr = await application.find(reqQuery)
            console.log(countr)
            if (countr.length != 0) return res.status(200).send({
                success: true,
                "application": countr[0]
            })
            else {
                return res.status(200).send({
                    success: false,
                    "applicationId": null
                })
            }
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



router.patch("/user", validationMiddleware, async (req, res, next) => {
    try {
        console.log("--------edit myprofile req recieved--------");
        let reqBody = req.body;
        // console.log(reqBody)
        const currentUserId = reqBody.user;
        delete reqBody.user;
        let currentUser = await user.findOne({ '_id': currentUserId })
        // console.log(currentUser);
        if (!currentUser) res.redirect('/logout');
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

router.delete("/user/:userId", async (req, res, next) => {
    try {
        console.log("-------entered in user delete req-------");
        const deleteUserId = req.params.userId;
        const currentUserId = req.body.user;
        // console.log(applicationId,currentUserId)
        const deleteUser = await user.findOne({ '_id': deleteUserId })
        if (!deleteUser) {
            throw new customError("user not found!", 404)
        }
        const currentUser = await user.findOne({ '_id': currentUserId });
        if (!currentUser) res.redirect('/logout');
        if (currentUser.userType !== "admin") {
            throw new customError("you are not allowed for deleting user!", 403)
        }
        const deletedUser = await user.deleteOne({ '_id': deleteUserId });
        console.log(deletedUser);
        if (deletedUser) {
            const appQuery = deleteUser.userType === "student" ? { studentId: deleteUserId } : { facultyId: deleteUserId }
            const applicationResult = await application.deleteMany(appQuery);
            if (!applicationResult) throw new customError("unable to delete applications of user", 500)
            if (deleteUser.userType === "faculty") {
                const jobResult = await job.deleteMany({ facultyId: deleteUserId });
                if (!jobResult) throw new customError("unable to delete facultys job", 500)
                console.log(jobResult);
            }
            console.log(applicationResult)
            // const result = await application.deleteMany({facutltyId:deleteUserId});
            if (applicationResult) return res.status(200).json({ success: true });
        }
        else {
            throw new customError("unable to delete user", 500)
        }
    }
    catch (error) {
        next(error);
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
        let reqQuery = {}
        console.log("-------alluserreq------");
        const currentUserId = req.body.user;
        const currentUser = await user.findOne({ '_id': currentUserId })

        if (!currentUser) res.redirect('/logout');
        else if (currentUser.userType !== "admin") {
            throw new customError("you are not allowed for this request!", 403);
        }
        else {
            user.find(reqQuery)
                .exec()
                .then(users => {
                    return res.status(200).send(users)
                })
                .catch(err => {
                    throw (err);
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
            .json({
                success: "successfully logout"
            })
    }
    catch (err) {
        res.status(401).send(err)
    }
})

router.use(errorHandling)
module.exports = router;
