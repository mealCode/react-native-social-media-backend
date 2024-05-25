import express, { Express, Request, Response } from 'express';
import { UserModel } from './database';
import bodyParser from 'body-parser';

const port = process.env.PORT || 3000;
const app: Express = express();
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 200,
  });
});

app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        code: 'BadRequest',
        message: 'User id is required',
      });
    }

    const user = await UserModel.findById(id);

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const { payload } = req.body;
    const user = await UserModel.create(payload);
    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.get('/users/nearby/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        code: 'BadRequest',
        message: 'userId is required',
      });
    }

    const currentUser = await UserModel.findById(userId);
    const coordinates = currentUser?.location?.coordinates;

    const nearbyUsers = await UserModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: coordinates as [number, number],
          },
          distanceField: 'distance',
          spherical: true,
        },
      },
      {
        $match: {
          _id: { $ne: currentUser?._id },
          interests: { $in: currentUser?.interests },
        },
      },
      {
        $sort: { distance: 1 }, // Sort by distance in ascending order (nearest first)
      },
    ]);

    return res.status(200).json({
      data: nearbyUsers,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
