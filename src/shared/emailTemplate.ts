import { ICreateAccount } from '../types/emailTamplate';

const otpBoxes = (otp: string) =>
  otp
    .split('')
    .map(
      (digit) => `
      <div style="
        display:inline-block;
        width:52px;
        height:52px;
        line-height:52px;
        text-align:center;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:12px;
        font-size:22px;
        font-weight:700;
        color:#0f172a;
        margin:0 4px;
      ">
        ${digit}
      </div>
    `
    )
    .join('');

const createAccount = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'SpendLock Email Verification Code',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="
        font-size:28px;
        font-weight:700;
        color:#0D8A77;
        letter-spacing:0.5px;
      ">
        SpendLock
      </span>
    </div>

    <!-- Card -->
    <div style="
      background:#ffffff;
      border:1px solid #e2e8f0;
      border-radius:20px;
      padding:40px 32px;
      text-align:center;
    ">

      <h1 style="
        margin:0 0 16px;
        color:#0f172a;
        font-size:28px;
        font-weight:700;
      ">
        Email Verification Code
      </h1>

      <p style="
        margin:0 0 32px;
        color:#64748b;
        font-size:16px;
        line-height:24px;
      ">
        Use the verification code below to complete your email verification for SpendLock.
      </p>

      <div style="margin-bottom:28px;">
        ${otpBoxes(values.otp)}
      </div>

      <p style="
        margin:0 0 12px;
        color:#0f172a;
        font-size:15px;
        font-weight:600;
      ">
        This code expires in 3 minutes.
      </p>

      <p style="
        margin:0;
        color:#64748b;
        font-size:14px;
        line-height:22px;
      ">
        For security reasons, do not share this code with anyone.
        SpendLock will never ask for your verification code.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="
        margin:0;
        color:#94a3b8;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} SpendLock. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`,
  };
};

const resetPassWord = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'SpendLock Password Reset Code',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Password Reset</title>
</head>

<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="
        font-size:28px;
        font-weight:700;
        color:#0D8A77;
        letter-spacing:0.5px;
      ">
        SpendLock
      </span>
    </div>

    <!-- Card -->
    <div style="
      background:#ffffff;
      border:1px solid #e2e8f0;
      border-radius:20px;
      padding:40px 32px;
      text-align:center;
    ">

      <h1 style="
        margin:0 0 16px;
        color:#0f172a;
        font-size:28px;
        font-weight:700;
      ">
        Password Reset Code
      </h1>

      <p style="
        margin:0 0 16px;
        color:#64748b;
        font-size:16px;
      ">
        Hi ${values?.name?.split(' ')[0] || 'there'},
      </p>

      <p style="
        margin:0 0 32px;
        color:#64748b;
        font-size:16px;
        line-height:24px;
      ">
        Use the verification code below to reset your SpendLock password.
      </p>

      <div style="margin-bottom:28px;">
        ${otpBoxes(values.otp)}
      </div>

      <p style="
        margin:0 0 12px;
        color:#0f172a;
        font-size:15px;
        font-weight:600;
      ">
        This code expires in 3 minutes.
      </p>

      <p style="
        margin:0;
        color:#64748b;
        font-size:14px;
        line-height:22px;
      ">
        If you did not request a password reset, you can safely ignore this email.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="
        margin:0;
        color:#94a3b8;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} SpendLock. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
`,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassWord,
};
