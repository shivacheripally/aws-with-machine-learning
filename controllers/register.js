import AmazonCognitoIdentity from "amazon-cognito-identity-js";
import AWS from "aws-sdk";
import { CLIENT_ID, REGION, USER_POOL_ID } from "../config/config.js";

const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const pool_region = REGION;
AWS.config.update({
  region: pool_region,
});
const RegisterUser = async (email) => {
  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email_verified",
      Value: "true",
    }),
  ];
  const randomPassword = "Abce@1234";
  const signUpParams = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: attributeList,
    TemporaryPassword: randomPassword,
  };

  await new AWS.CognitoIdentityServiceProvider()
    .adminCreateUser(signUpParams)
    .promise();

  const groupParams = {
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  await new AWS.CognitoIdentityServiceProvider()
    // .adminAddUserToGroup(groupParams)
    .promise();

  return "User Registered Successfully";
};

export const registerUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    await RegisterUser(email)
      .then((response) => {
        res.status(200).json({ message: response });
      })
      .catch((err) => {
        if (
          err.message ===
          "Email is already registered. Please choose a different email."
        ) {
          //   logger.error({
          //     message: `${email} is already registered.`,
          //     statusCode: 400,
          //   });
          res.status(400).json({
            message: `${email} is already registered.`,
          });
        } else {
          //   logger.error({
          //     message: err.message,
          //     statusCode: 400,
          //   });
          res.status(400).json({ error: err.message });
        }
      });
  } catch (error) {
    console.log("Error ", error);
    // logger.error({
    //   message: error.message,
    //   stack: JSON.stringify(error.stack),
    // });
    next(error);
  }
};

//change-password
const ChangePassword = async (username, password, newPassword) => {
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: username,
      Password: password,
      NewPassword: newPassword,
    }
  );

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  try {
    await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          cognitoUser.changePassword(password, newPassword, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
          cognitoUser.completeNewPasswordChallenge(
            newPassword,
            {},
            {
              onSuccess: async (session) => {
                resolve("Password updated successfully");
              },
              onFailure: (err) => {
                console.log(err);
                reject("failed to update Password");
              },
            }
          );
        },
      });
    });

    return "Password updated Successfully.";
  } catch (error) {
    logger.error({
      message: error.message,
      stack: JSON.stringify(error.stack),
    });
    if (error?.message === "Incorrect username or password.") {
      throw new BadRequestError(error?.message);
    } else {
      throw new InternalServerError("Internal Server Error");
    }
  }
};

export const updatePassword = async (req, res, next) => {
  const { email, password, newPassword } = req.body;
  if (password === newPassword)
    throw new BadRequestError(
      "new password must be different from the last password"
    );

  try {
    await ChangePassword(email, password, newPassword)
      .then((response) => {
        if (response) {
          res.status(200).json({ message: response });
        }
      })
      .catch((err) => {
        console.log(`Error `, err);
        // logger.error({
        //   message: err.message,
        //   stack: JSON.stringify(err.stack),
        // });
        throw new BadRequestError(err?.message);
      });
  } catch (error) {
    console.log(`Error `, error);
    // logger.error({
    //   message: error.message,
    //   stack: JSON.stringify(error.stack),
    // });
    next(error);
  }
};

// loginUser
const Login = async (email, password) => {
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: email,
      Password: password,
    }
  );

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const users = await listUsers();
  const usersWithDetails = await Promise.all(
    users.map(async (user) => {
      const userDetails = await getUserDetails(user);
      return userDetails;
    })
  );

  const data = await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (res) => {
        const { username } = usersWithDetails?.find(
          (item) => item.email === email
        );
        const accessToken = res.getAccessToken().getJwtToken();
        resolve({
          email,
          username,
          token: accessToken
        });
      },
      onFailure: function (err) {
        reject(err);
      },
      newPasswordRequired: () => {
        reject("Please update your password.");
      },
    });
  });

  return data;
};

// get all the user_list
const listUsers = async () => {
  const cognitoISP = new AWS.CognitoIdentityServiceProvider();
  const listUsersParams = {
    UserPoolId: USER_POOL_ID,
  };
  const userList = await cognitoISP.listUsers(listUsersParams).promise();
  return userList.Users;
};

const getUserDetails = async (user) => {
  const email = user.Attributes.find((attr) => {
    return attr.Name === "email";
  })?.Value;
  const username = user.Attributes.find((attr) => {
    return attr.Name === "custom:username";
  })?.Value;
  return {
    email,
    verified: user.UserStatus,
    username,
    addedDate: user.UserCreateDate,
  };
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const response = await Login(email, password);

    if (response) {
      return res.status(200).json({ token: response.token });
    }
  } catch (err) {
    console.log("error -> ", err);

    // Handle specific errors
    if (err?.message == "User does not exist.") {
      next(new NotFoundError(err?.message));
    } else if (err?.message === "Incorrect username or password.") {
      console.log("Invalid Credentials, Please check your email and password and try again.");
      next(new BadRequestError("Invalid Credentials, Please check your email and password and try again."));
    } else if (err?.message === "User is not confirmed") {
      next(new BadRequestError("User is not Verified."));
    } else if (err === "Please update your password.") {
      next(new ForbiddenError("Please update your password."));
    } else {
      next(new InternalServerError("Internal Server Error"));
    }
  }
};
