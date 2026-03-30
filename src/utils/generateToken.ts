import jwt from 'jsonwebtoken';

const generateToken = (res: any, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
