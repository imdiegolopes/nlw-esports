import express, { Request, Response } from "express";
import {
  httpStatusCode,
  httpResponse,
} from "../presentation/http/httpResponse";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { router } from "./protocols/http/router";

const app = express();
const prismaClient = new PrismaClient({
  log: ["query"],
});

app.use(express.json());
app.use(cors());

app.use(router);

app.get("/v1/games/:id/ads", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatusCode.BAD_REQUEST).json(httpResponse({}));
    }

    const ads = await prismaClient.ad.findMany({
      select: {
        id: true,
        name: true,
        weekDays: true,
        useVoiceChannel: true,
        hoursStart: true,
        hoursEnd: true,
      },
      where: { gameId: id },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!ads) {
      return res.status(httpStatusCode.NOT_FOUND).json(httpResponse({}));
    }

    return res.status(httpStatusCode.OK).json(httpResponse(ads));
  } catch (error: any) {
    return res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json(httpResponse(error));
  }
});

app.post("/v1/games/:id/ads", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!id || !body) {
      return res.status(httpStatusCode.BAD_REQUEST).json(httpResponse({}));
    }

    const data = {
      gameId: id,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays,
      hoursStart: body.hoursStart,
      hoursEnd: body.hoursEnd,
      useVoiceChannel: body.useVoiceChannel,
    };

    const ads = await prismaClient.ad.create({ data });

    if (!ads) {
      return res
        .status(httpStatusCode.INTERNAL_SERVER_ERROR)
        .json(httpResponse({}));
    }

    return res.status(httpStatusCode.CREATED).json(httpResponse(ads));
  } catch (error: any) {
    console.log({ error });
    return res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json(httpResponse(error));
  }
});


app.post("/v1/ads", (_req: Request, res: Response) => {
  const response = {};

  res.status(httpStatusCode.CREATED).json(httpResponse(response));
});

app.get("/v1/ads/:id/discord", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatusCode.BAD_REQUEST).json(httpResponse({}));
    }

    const ads = await prismaClient.ad.findUnique({
      where: { id: id },
      select: {
        discord: true,
      },
    });

    if (!ads) {
      return res.status(httpStatusCode.NOT_FOUND).json(httpResponse({}));
    }

    return res.status(httpStatusCode.OK).json(httpResponse(ads));
  } catch (error: any) {
    return res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR)
      .json(httpResponse(error));
  }
});

app.listen("3000", () => {
  console.log(`NWL eSports API is running at port ${3000}`);
});
