const express = require('express');
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
  // TODO: validate form values

  const pdfBuffer = await fsp.readFile(`${__dirname}/static/eula/KIPR-Parental-Consent.pdf`);
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

  // Fill PDF form based on values from request body
  for (const bodyParam in PDF_FIELD_MAP) {
    const formKey = PDF_FIELD_MAP[bodyParam];
    pdfDoc.getForm().getTextField(formKey).setText(formValues[bodyParam]);
    pdfDoc.getForm().getTextField(formKey).enableReadOnly();
  }

  return await pdfDoc.save();
}

function createRouter(firebaseTokenManager, mailgunClient, config) {
  const router = express.Router();

  // API to generate parental consent form from form values
  router.post('/generate-form', asyncExpressHandler(async (req, res) => {
    // TODO: add parent token authentication

    if (!('version' in req.body) || typeof req.body.version !== 'string') {
      return res.status(400).json({
        error: "Expected version string in body"
      });
    }

    // TODO: ensure that requested version is the latest version
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
    res.set('X-Consent-Version', CURRENT_PDF_VERSION); // TODO: unsure if custom header is the right way to version
    res.end(pdfData);
  }));

  // API to get parental consent for the user
  // TODO: this API needs throttling since it requires a database read for the authorization check
  router.get('/:userId', asyncExpressHandler(async (req, res) => {
    // TODO: centralize this authorization check logic
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

    // Ensure that parent token matches the one stored in the database
    const parentConsentTokenHash = currentConsent?.legalAcceptance?.parentConsentTokenHash;
    const authorizationValueHash = getHashForParentToken(authorization.value);
    if (!parentConsentTokenHash || parentConsentTokenHash !== authorizationValueHash) {
      console.error('Parent token is not valid for the user');
      res.status(401).send();
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
  router.post('/:userId', asyncExpressHandler(async (req, res) => {
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

    if (!('autoDelete' in req.body)) {
      return res.status(400).json({
        error: "Expected autoDelete key in body"
      });
    }

    if (typeof req.body.autoDelete !== 'boolean') {
      return res.status(400).json({
        error: "Expected autoDelete key in body to be a boolean"
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

    if (currentConsent !== null && currentConsent.legalAcceptance?.state !== 'not-started') {
      // TODO: it's okay for "not-started" consent to exist...?
      console.error('Consent already exists for user');
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

    // Update user consent in db
    const nextUserConsent = {
      dateOfBirth: req.body.dateOfBirth,
      legalAcceptance: {
        state: 'awaiting-parental-consent',
        version: 1,
        sentAt: new Date().toISOString(),
        parentEmailAddress: req.body.parentEmailAddress,
        parentConsentTokenHash: parentConsentTokenHash,
        autoDelete: req.body.autoDelete,
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
  // TODO: this API needs throttling since it requires a database read for the authorization check
  router.patch('/:userId', asyncExpressHandler(async (req, res) => {
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

    // Ensure that parent token matches the one stored in the database
    const parentConsentTokenHash = currentConsent?.legalAcceptance?.parentConsentTokenHash;
    const authorizationValueHash = getHashForParentToken(authorization.value);
    if (!parentConsentTokenHash || parentConsentTokenHash !== authorizationValueHash) {
      console.error('Parent token is not valid for the user');
      res.status(401).send();
      return;
    }

    if (!req.is('application/json')) {
      console.error('Content-Type is not json');
      res.status(415).send();
      return;
    }

    const consentRequestSentAt = currentConsent?.legalAcceptance?.sentAt;
    const consentRequestSentAtMs = consentRequestSentAt ? Date.parse(consentRequestSentAt) : NaN;
    if (isNaN(consentRequestSentAtMs)) {
      console.error('Sent at time is not valid');
      res.status(500).send();
      return;
    }

    const currMs = new Date().getTime();
    if (currMs - consentRequestSentAtMs > 48 * 60 * 60 * 1000) {
      console.error('Consent was requested too long ago');
      res.status(400).send();
      return;
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
      if (!(bodyParam in req.body.form) || typeof req.body.form[bodyParam] !== 'string') {
        return res.status(400).json({
          error: `Expected '${bodyParam}' in request body form object`
        });
      }
    }

    // TODO: try-catch to handle validation errors
    const pdfData = await generateParentConsentForm(req.body.form);

    // Save parental consent PDF
    let storeResponse;
    try {
      storeResponse = await uploadParentalConsentPdf(pdfData, userId, firebaseIdToken, config);
    } catch (storeError) {
      console.error('Failed to store parental consent PDF', storeError);
      res.status(500).send();
      return;
    }

    const parentalConsentUri = storeResponse.cloudStorageUri;

    const nextUserConsent = {
      ...currentConsent,
      legalAcceptance: {
        state: 'obtained-parental-consent',
        version: 1,
        receivedAt: new Date().toISOString(),
        parentEmailAddress: currentConsent.legalAcceptance.parentEmailAddress,
        parentalConsentUri: parentalConsentUri,
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

    console.error('ERROR:', error)
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

  // TODO: compose final email
  const mailgunData = {
    from: `test@${domain}`,
    to: parentEmailAddress,
    subject: `Parent/Guardian Consent for KIPR Simulator`,
    template: 'consent',
    'h:X-Mailgun-Variables': JSON.stringify({
      consentlink: consentLink
    }),
    // 'h:Reply-To': 'reply-to@example.com',
  };

  return mailgunClient.messages.create(domain, mailgunData);
}

function sendParentalConsentConfirmationEmail(parentEmailAddress, pdfData, mailgunClient, config) {
  const domain = config.mailgun.domain;

  const pdfDataBuffer = Buffer.from(pdfData);

  // TODO: compose final email
  const mailgunData = {
    from: `test@${domain}`,
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
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Reusable handler to ensure async errors are caught and passed onto express error handlers
const asyncExpressHandler = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next))
    .catch(next);
}

module.exports = createRouter;