import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const bearer = req.header('Authorization');
  // console.log(bearer);
  if (!bearer) {
    return res.status(401).send({ error: 'No token provided' });
  }

  const token = bearer.split(' ')[1];

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Failed to authenticate token' });
    }

    req.sellerId = decoded.id;
    console.log(req.sellerId);
    next();
  });
};
