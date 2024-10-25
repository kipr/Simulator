/* eslint-env node */

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios').default;
const crypto = require('crypto');
const fsp = require('fs').promises;
const pdfLib = require('pdf-lib');
const { getAuth } = require('firebase-admin/auth');

const CURRENT_PDF_VERSION = '1';

const PDF_FIELD_MAP = Object.freeze({
  'program': 'Program',
  'childFullName': `Child's Full Name`,
  'childDateOfBirth': 'Date of Birth',
  'childEmail': 'Email Used for Sign Up',
  'parentFullName': 'Full Name',
  'parentRelationship': 'Relationship to the Child',
  'parentEmailAddress': 'Email Address',
  'signature': 'Parent/Legal Guardian Signature',
  'signatureDate': 'Date Signed',
});

async function generateParentConsentForm(formValues) {
  const pdfBuffer = await fsp.readFile(`${__dirname}/static/eula/KIPR-Parental-Consent.pdf`);
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

  // Fill PDF form based on values from request body
  for (const bodyParam in PDF_FIELD_MAP) {
    const formKey = PDF_FIELD_MAP[bodyParam];
    pdfDoc
      .getForm()
      .getTextField(formKey)
      .setText(formValues[bodyParam]);
    pdfDoc
      .getForm()
      .getTextField(formKey)
      .enableReadOnly();
  }

  return await pdfDoc.save();
}

function createRouter(firebaseTokenManager, mailgunClient, config) {
  const router = express.Router();
  const validateParentToken = createValidateParentTokenMiddleware(firebaseTokenManager, config);
  const validateUserToken = createValidateUserTokenMiddleware();

  // API to generate parental consent form from form values
  // Authorization: parent token
  router.post('/:userId/generate-form', createGlobalRateLimiter(60, 1000), asyncExpressHandler(validateParentToken), asyncExpressHandler(async (req, res) => {
    if (!('version' in req.body) || typeof req.body.version !== 'string') {
      return res.status(400).json({
        error: "Expected version string in body"
      });
    }

    // Ensure that requested version is the latest version
    if (req.body.version !== CURRENT_PDF_VERSION.toString()) {
      return res.status(400).json({
        error: `Expected version ${CURRENT_PDF_VERSION}`
      });
    }

    // Ensure request body has "form" key of type object
    if (!('form' in req.body) || typeof req.body.form !== 'object') {
      return res.status(400).json({
        error: "Expected form object in body"
      });
    }

    // Ensure request body has all fields in the "form" object
    for (const bodyParam in PDF_FIELD_MAP) {
      if (!(bodyParam in req.body.form) || typeof req.body.form[bodyParam] !== 'string') {
        return res.status(400).json({
          error: `Expected '${bodyParam}' in request body form object`
        });
      }
    }

    let pdfData = null;
    try {
      pdfData = await generateParentConsentForm(req.body.form);      
    } catch (e) {
      console.error('Failed to generate parental consent form', e);
      res.status(400).send();
      return;
    }

    res.type('application/pdf');
    res.set('X-Consent-Version', CURRENT_PDF_VERSION); // can be used in the future to ensure client has the latest version
    res.end(pdfData);
  }));

  // API to get parental consent for the user
  // Authorization: parent token
  router.get('/:userId', createGlobalRateLimiter(60, 1000), asyncExpressHandler(validateParentToken), asyncExpressHandler(async (req, res) => {
    const userId = req.params['userId'];
    const currentConsent = res.locals.currentConsent;
    if (!currentConsent) {
      console.error('Current consent not found in res.locals');
      res.status(500).send();
      return;
    }

    // Send user's email in the response for the parent to verify
    const user = await getAuth().getUser(userId);
    if (!user || !user.email) {
      console.error('Failed to get user email');
      res.status(500).send();
      return;
    }

    res.status(200).json({
      state: currentConsent.legalAcceptance.state,
      userDateOfBirth: currentConsent.dateOfBirth,
      userEmail: user.email,
    });
  }));

  // API to start parental consent for the user
  // Authorization: user token
  router.post('/:userId', createGlobalRateLimiter(60, 1000), asyncExpressHandler(validateUserToken), asyncExpressHandler(async (req, res) => {
    const userId = req.params['userId'];

    if (!('dateOfBirth' in req.body)) {
      return res.status(400).json({
        error: "Expected dateOfBirth key in body"
      });
    }

    if (typeof req.body.dateOfBirth !== 'string') {
      return res.status(400).json({
        error: "Expected dateOfBirth key in body to be a string"
      });
    }

    if (!('parentEmailAddress' in req.body)) {
      return res.status(400).json({
        error: "Expected parentEmailAddress key in body"
      });
    }

    if (typeof req.body.parentEmailAddress !== 'string') {
      return res.status(400).json({
        error: "Expected parentEmailAddress key in body to be a string"
      });
    }

    const user = await getAuth().getUser(userId);
    if (req.body.parentEmailAddress.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({
        error: `Parent email address cannot be the same as user's email address`
      });
    }

    console.log('getting parental consent for user', userId);
    const firebaseIdToken = firebaseTokenManager.getToken();

    let currentConsent;
    try {
      currentConsent = await getCurrentConsent(userId, firebaseIdToken, config);
    } catch (getConsentError) {
      console.error('Failed to get current consent state', getConsentError);
      res.status(400).send();
      return;
    }

    // Generate a random one-time token for parent to access consent page
    // The token is sent as part of the link in the email to the parent
    // The token hash is stored in the database for verification later
    const parentConsentToken = crypto.randomBytes(16).toString('hex');
    const parentConsentTokenHash = getHashForParentToken(parentConsentToken);

    // Send email to parent
    console.log('sending email to parent');
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    try {
      await sendParentalConsentEmail(userId, parentConsentToken, req.body.parentEmailAddress, baseUrl, mailgunClient, config);
    } catch (sendEmailError) {
      console.error('Failed to send parent consent email', sendEmailError);
      res.status(500).send();
      return;
    }

    const now = Date.now();
    let expiresAt = null;
    if (currentConsent === null) {
      // Existing user consenting for the first time, so give them 7 days
      expiresAt = new Date(now);
      expiresAt.setUTCHours(expiresAt.getUTCHours() + 7 * 24);
    } else if (currentConsent.legalAcceptance.state === 'not-started') {
      // New user, so give them 2 days
      expiresAt = new Date(now);
      expiresAt.setUTCHours(expiresAt.getUTCHours() + 2 * 24);
    } else {
      // Existing user re-consenting, so don't expire at all
    }

    // Update user consent in db
    const nextUserConsent = {
      dateOfBirth: req.body.dateOfBirth,
      legalAcceptance: {
        state: 'awaiting-parental-consent',
        version: 1,
        sentAt: now,
        parentEmailAddress: req.body.parentEmailAddress,
        parentConsentTokenHash: parentConsentTokenHash,
        expiresAt: expiresAt?.valueOf(),
      },
    };

    try {
      await setConsent(userId, nextUserConsent, firebaseIdToken, config);
    } catch (setConsentError) {
      console.error('Failed to set consent', setConsentError);
      res.status(400).send();
      return;
    }

    res.status(200).send(nextUserConsent);
  }));

  // API to update parental consent for the user
  // Currently it only supports completing the consent flow
  // Authorization: parent token
  router.patch('/:userId', createGlobalRateLimiter(60, 1000), asyncExpressHandler(validateParentToken), asyncExpressHandler(async (req, res) => {
    const userId = req.params['userId'];
    const currentConsent = res.locals.currentConsent;

    if (!req.is('application/json')) {
      console.error('Content-Type is not json');
      res.status(415).send();
      return;
    }

    const currMs = Date.now();
    const consentRequestExpiresAt = currentConsent?.legalAcceptance?.expiresAt;
    if (typeof(consentRequestExpiresAt) === 'number') {  
      if (currMs >= consentRequestExpiresAt) {
        console.error('Consent was requested too long ago');
        res.status(400).send();
        return;
      }
    }

    if (!('version' in req.body) || typeof req.body.version !== 'string') {
      return res.status(400).json({
        error: "Expected version string in body"
      });
    }

    // Ensure provided version is the latest version
    if (req.body.version !== CURRENT_PDF_VERSION.toString()) {
      return res.status(400).json({
        error: `Expected version ${CURRENT_PDF_VERSION}`
      });
    }

    // Ensure request body has "form" key of type object
    if (!('form' in req.body) || typeof req.body.form !== 'object') {
      return res.status(400).json({
        error: "Expected form object in body"
      });
    }

    // Ensure request body has all fields in the "form" object
    for (const bodyParam in PDF_FIELD_MAP) {
      if (!(bodyParam in req.body.form) || typeof req.body.form[bodyParam] !== 'string' || req.body.form[bodyParam].length === 0) {
        return res.status(400).json({
          error: `Expected '${bodyParam}' in request body form object`
        });
      }
    }

    const user = await getAuth().getUser(userId);
    if (!user || !user.email) {
      console.error('Failed to get user email');
      res.status(500).send();
      return;
    }

    try {
      const expectedChildDateOfBirth = new Date(currentConsent.dateOfBirth);
      const expectedChildEmail = user.email;
      validateParentConsentForm(req.body.form, expectedChildDateOfBirth, expectedChildEmail);
    } catch (validationError) {
      console.error('Validation of form values failed', validationError);
      res.status(400).send();
      return;
    }

    const pdfData = await generateParentConsentForm(req.body.form);

    // Save parental consent PDF
    const firebaseIdToken = firebaseTokenManager.getToken();
    let storeResponse;
    try {
      storeResponse = await uploadParentalConsentPdf(pdfData, userId, firebaseIdToken, config);
    } catch (storeError) {
      console.error('Failed to store parental consent PDF', storeError);
      res.status(500).send();
      return;
    }

    const parentalConsentUri = storeResponse.cloudStorageUri;

    // Consent is valid until the user turns 16
    const consentExpiresAt = new Date(currentConsent.dateOfBirth);
    consentExpiresAt.setUTCFullYear(consentExpiresAt.getUTCFullYear() + 16);

    const nextUserConsent = {
      ...currentConsent,
      legalAcceptance: {
        state: 'obtained-parental-consent',
        version: 1,
        receivedAt: currMs,
        parentEmailAddress: currentConsent.legalAcceptance.parentEmailAddress,
        parentalConsentUri: parentalConsentUri,
        expiresAt: consentExpiresAt.valueOf(),
      },
    };

    try {
      await setConsent(userId, nextUserConsent, firebaseIdToken, config);
    } catch (setConsentError) {
      console.error('Failed to set consent', setConsentError);
      res.status(400).send();
      return;
    }

    try {
      await sendParentalConsentConfirmationEmail(currentConsent.legalAcceptance.parentEmailAddress, pdfData, mailgunClient, config);
    } catch (sendConfirmationError) {
      console.error('Failed to send confirmation email', sendConfirmationError);
      res.status(500).send();
      return;
    }

    res.status(200).send();
  }));

  return router;
}

// Convert a date from a string in the format 'MM/DD/YYYY' to a Date object
function formDateStringToDate(formDateString) {
  const regexResult = /^(0[1-9]|1[012])(?:\/|-)(0[1-9]|[12][0-9]|3[01])(?:\/|-)((?:19|20)\d{2})$/.exec(formDateString);
  if (!regexResult) {
    throw new Error('Invalid date format');
  }

  const [month, day, year] = regexResult.slice(1).map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (dateObj.getUTCMonth() !== month - 1) {
    throw new Error('Invalid date');
  }

  return dateObj;
}

function validateParentConsentForm(formValues, expectedChildDateOfBirth, expectedChildEmail) {
  const childDateOfBirth = formDateStringToDate(formValues['childDateOfBirth']);
  if (childDateOfBirth.getTime() !== expectedChildDateOfBirth.getTime()) {
    throw new Error('Child date of birth does not match expected value');
  }

  if (formValues['childEmail'] !== expectedChildEmail) {
    throw new Error('Child email does not match expected value');
  }

  // Allow 2 days of leeway for signature date since we don't know the client's timezone
  const signatureDate = formDateStringToDate(formValues['signatureDate']);
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  if (Math.abs(signatureDate.getTime() - Date.now()) > twoDaysMs) {
    throw new Error('Signature date is too far from current date');
  }
}

async function getCurrentConsent(userId, token, config) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${config.dbUrl}/user/${userId}`, requestConfig);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }

    console.error('ERROR:', error);
    throw error;
  }
}

async function uploadParentalConsentPdf(pdfData, userId, token, config) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf',
      'Big-Store-Prefix': 'parental-consent',
      'Big-Store-Metadata': JSON.stringify({
        userId: userId,
      }),
    },
  };

  const response = await axios.post(`${config.dbUrl}/v1/big_store`, pdfData, requestConfig);
  return response.data;
}

async function setConsent(userId, nextUserConsent, token, config) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${config.dbUrl}/user/${userId}`, nextUserConsent, requestConfig);
  return response.data;
}

function sendParentalConsentEmail(userId, parentConsentToken, parentEmailAddress, baseUrl, mailgunClient, config) {
  const domain = config.mailgun.domain;
  const consentLink = `${baseUrl}/parental-consent/${userId}?token=${parentConsentToken}`;

  const mailgunData = {
    from: `privacy@${domain}`,
    to: parentEmailAddress,
    subject: `Parent/Guardian Consent for KIPR Simulator`,
    template: 'consent',
    'h:X-Mailgun-Variables': JSON.stringify({
      consentlink: consentLink
    }),
  };

  return mailgunClient.messages.create(domain, mailgunData);
}

function sendParentalConsentConfirmationEmail(parentEmailAddress, pdfData, mailgunClient, config) {
  const domain = config.mailgun.domain;

  const pdfDataBuffer = Buffer.from(pdfData);

  const mailgunData = {
    from: `privacy@${domain}`,
    to: parentEmailAddress,
    subject: `Parent/Guardian Consent Confirmation for KIPR Simulator`,
    template: 'consent confirmation',
    attachment: {
      data: pdfDataBuffer,
      filename: 'KIPR_Simulator_Consent.pdf',
      contentType: 'application/pdf',
    },
  };

  return mailgunClient.messages.create(domain, mailgunData);
}

function parseAuthorization(req) {
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader) {
    console.error('Authorization header is missing');
    return null;
  }

  const [authorizationType, authorizationValue] = authorizationHeader.split(' ');
  if (!authorizationType || !authorizationValue) {
    console.error('Authorization header is not valid');
    return null;
  }

  return { type: authorizationType, value: authorizationValue };
}

function getHashForParentToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

// Creates express middleware to perform auth check for user tokens
const createValidateUserTokenMiddleware = () => async (req, res, next) => {
  const authorization = parseAuthorization(req);
  if (!authorization || authorization.type !== 'Bearer') {
    res.status(401).send();
    return;
  }

  const userId = req.params['userId'];
  let decodedIdToken;

  try {
    decodedIdToken = await getAuth().verifyIdToken(authorization.value, true);
  } catch (e) {
    console.error('ID token validation failed with error', e);
    res.status(401).send();
    return;
  }

  if (decodedIdToken.uid !== userId) {
    console.error('User ID in token does not match request');
    res.status(403).send();
    return;
  }

  next();
};

// Creates express middleware to perform auth check for parent tokens
const createValidateParentTokenMiddleware = (firebaseTokenManager, config) => async (req, res, next) => {
  const authorization = parseAuthorization(req);
  if (!authorization || authorization.type !== 'ParentToken') {
    res.status(401).send();
    return;
  }

  const userId = req.params['userId'];
  const firebaseIdToken = firebaseTokenManager.getToken();

  let currentConsent;
  try {
    currentConsent = await getCurrentConsent(userId, firebaseIdToken, config);
  } catch (getConsentError) {
    console.error('Failed to get current consent state', getConsentError);
    res.status(500).send();
    return;
  }

  if (currentConsent?.legalAcceptance?.state !== 'awaiting-parental-consent') {
    // Send 401 to avoid leaking information about consent state
    console.error('Current state is not awaiting parental consent');
    res.status(401).send();
    return;
  }

  const expiresAt = currentConsent?.legalAcceptance?.expiresAt;
  if (typeof(expiresAt) === 'number' && Date.now() >= expiresAt) {
    console.error('Parental consent request has expired');
    res.status(401).send();
    return;
  }

  // Ensure that parent token matches the one stored in the database
  const parentConsentTokenHash = currentConsent?.legalAcceptance?.parentConsentTokenHash;
  const authorizationValueHash = getHashForParentToken(authorization.value);
  if (!parentConsentTokenHash || parentConsentTokenHash !== authorizationValueHash) {
    console.error('Parent token is not valid for the user');
    res.status(401).send();
    return;
  }

  // Store current consent in res.locals for subsequent handlers to use without re-fetching
  res.locals.currentConsent = currentConsent;

  next();
};

// Creates express middleware to rate limit requests globally
const createGlobalRateLimiter = (windowSeconds, limit) => {
  return rateLimit({
    windowMs: windowSeconds * 1000,
    limit: limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: () => 'global',
  });
};

// Reusable handler to ensure async errors are caught and passed onto express error handlers
const asyncExpressHandler = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next))
    .catch(next);
};

module.exports = createRouter;