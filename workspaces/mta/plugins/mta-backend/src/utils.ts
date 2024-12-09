import jwt, { JwtPayload } from 'jsonwebtoken';

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded) {
      console.error('Failed to decode the token.');
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiry = decoded.exp ?? 0;
    return expiry < currentTime;
  } catch (error) {
    console.error('Error decoding token: ', error);
    return true;
  }
};
