const express = require('express');
const crypto = require('crypto');
const transporter = require('../helper/nodemailer')
const common = require('../helper/common');
const jwt = require("jsonwebtoken");
var userDB = require('../Models/user.model');
var userLoginDB = require("../Models/userLogin.model")
var queryHelper = require('../helper/query');
const mongoose = require('mongoose');
var Encrypter = require('../helper/crypter');
const { io } = require('../socket');
require('dotenv').config();


const emitTokenUpdate = (newToken, email) => {
    if (email !== null){
    io.emit(`tokenUpdate${email}`, newToken);
        console.log(email)
    }
   
};

// To Login the Registered user with this API.
exports.loginFunction = async (req, res) => {
    try {
        let { email, password } = req.body;
        const existingUser = await userDB.findOne({ email })

        if (existingUser) {
            let tokenData = { email, password }
            let tokenExpiresDetails = { expiresIn: '5m' }
            let token = jwt.sign(tokenData, "test", tokenExpiresDetails)
            // const tokenUpdated = await userDB.findOneAndUpdate({ email }, { $set: { token } })
            //emitTokenUpdate(token, email);
            return res.status(200).send({ status: true, message: "Login Successfully", token })
        } else {

            return res.status(200).send({ status: true, message: "No User Found" });

        }


    } catch (error) {
        console.log('error: ', error);
        return res.status(404).send({ status: false, message: error });

    }
}




/** To add User Register Data on DB by using this API */
exports.registerFunction = async (req, res) => {
    try {
        let { username, email, password, confirmPassword, token } = req.body;

        const existingUser = await userDB.findOne({ email })
        if (existingUser) {
            return res.status(400).send({ status: false, message: "It seems you already have an account, please log in instead.", });
        } else {

            let regData = { username, email, password, confirmPassword, token }

            userDB.insertMany(regData, async (err, data) => {
                if (err) {
                    return res.status(409).send({ status: false, message: "Error in Register" });
                }
                else {

                    return res.status(200).send({ status: true, message: data });
                }
            })
        }
    } catch (error) {
        console.log('error: ', error);
        return res.status(404).send({ status: false, message: 'Something Went Wrong' });
    }
}

// To Verify User Verification Status using this API
exports.registerVerify = async (req, res) => {
    try {
        let { verifyToken } = req.body;
        const verifyTokenFromDB = await userDB.findOne({ verificationString: verifyToken })
        const countInDB = await userDB.countDocuments()
        if (verifyTokenFromDB) {
            if (!verifyTokenFromDB.verifiedStatus) {
                const values = await common.createWallet()
                const userId = await common.generateId('UPRO', countInDB)
                let updateVerifiedStatus = await userDB.findOneAndUpdate({ verificationString: verifyTokenFromDB.verificationString }, { verifiedStatus: true, accountDetails: { address: Encrypter(values.address, 'ENCRYPT'), privateKey: Encrypter(values.privateKey, 'ENCRYPT'), phrase: Encrypter(values.mnemonic, 'ENCRYPT') }, u_id: userId })
                if (updateVerifiedStatus) {
                    return res.status(200).send({ status: true, message: 'Verified Status Successfully Updated' })
                } else {
                    return res.status(409).send({ status: false, message: "Verification Status Update Failed" })
                }
            } else {
                return res.status(201).send({ status: false, message: "Verification Already Updated" })
            }
        } else {
            return res.status(409).send({ status: false, message: "Error in Fetching Verification String" })
        }

    } catch (err) {
        console.log('err: ', err);
        return res.status(404).send({ status: false, message: 'Something Went Wrong' })
    }
}


exports.userProfile = (req, res) => {
    try {
        queryHelper.findoneData("Backend", { "u_id": req.userId.u_id }, {}, async (result) => {
            if (result) {
                console.log('result: ', result);
                let [newAddress] = [Encrypter(result['accountDetails'].address, 'DECRYPT')]
                return res.status(200).send({ status: true, data: { result, decryptedDetails: { address: newAddress } } });
            } else {
                return res.status(404).send({ status: false, message: 'Something Went Wrong' });
            }
        })
    } catch (error) {
        console.log('error: ', error);
        return res.status(404).send({ status: false, message: 'Something Went Wrong' });
    }
}
