import { Application, Context, Router, RouterContext, send  } from "jsr:@oak/oak/";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
// import { privateEncrypt } from "node:crypto";
import{MongoClient, Collection, Db} from "npm:mongodb@6.16.0";
import { render } from "https://deno.land/x/eta@v3.5.0/src/render.ts";

const MONGODB_URI = "mongodb://localhost:27017/";
const DB_NAME = "Hotel";

if (!MONGODB_URI)
{
    console.error("MONGODB_URI is not set");
    Deno.exit(1);
}

const client = new MongoClient(MONGODB_URI);

try {
    await client.connect();
    await client.db("admin")
    console.log("Connected!");
}
catch (error) {
    console.error("Error connecting to MongoDB : ", error);
    Deno.exit(1);
}

interface MaxDataProps {
    room : number,
    number_of_places: number
}

interface CurrentDataProps {
    room : number,
    guests : string[]
}

interface GuestsProps {
    guest : string
}

const db : Db = client.db(DB_NAME);
const MaxData : Collection<MaxDataProps> = db.collection("MaxData");
const CurrentData : Collection<CurrentDataProps> = db.collection("CurrentData");
const Guests : Collection<GuestsProps> = db.collection("Guests");

// dodani goscie - 
// Guests.insertMany([
//   { "guest": "Anna Nowak" },
//   { "guest": "Marek Kowalski" },
//   { "guest": "Ewa Wiśniewska" },
//   { "guest": "Piotr Zieliński" },
//   { "guest": "Katarzyna Dąbrowska" },
//   { "guest": "Tomasz Wójcik" },
//   { "guest": "Agnieszka Lewandowska" },
//   { "guest": "Paweł Kamiński" },
//   { "guest": "Magdalena Szymańska" },
//   { "guest": "Krzysztof Kaczmarek" }
// ]);
// MaxData.insertMany([
//     { "room": 1, "number_of_places" : 3 },
//     { "room": 2, "number_of_places" : 4 },
//     { "room": 3, "number_of_places" : 2 }
// ])
// CurrentData.insertMany([
//     { "room": 1, "guests" : [] },
//     { "room": 2, "guests" : [] },
//     { "room": 3, "guests" : [] }
// ])

const app: Application  = new Application();
const router: Router = new Router({
});
const eta: Eta = new Eta({ views: `${Deno.cwd()}/views` });

router
.get("/", (ctx: Context) => {
    const res: string = eta.render("./index", {});
    ctx.response.body = res;
})
.get("/form", (ctx: Context) => {
    const res: string = eta.render("./form", {});
    ctx.response.body = res;
})
.get("/load", async (ctx: Context) => {
    try { 
        const maxPlaces = await MaxData.find({}).toArray();
        const currentPlaces = await CurrentData.find({}).toArray(); 
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify({ maxData : maxPlaces, currentData : currentPlaces})
    }
    catch (error : any)
    {
        console.log("[ERROR LOAD] ", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
        return;
    }
})
.get("/display", async (ctx : Context) => {
    try 
    {
        const getCurrentData = await CurrentData.find({}).toArray();
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify({ currentData : getCurrentData})
    }
    catch (error : any) {
        console.log("[ERROR LOAD] ", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
        return;
    }
})
.post("/display", async (ctx : Context) => {
    const reqBodyJson: { room : number } = await ctx.request.body.json();
    if (reqBodyJson.room)
    {
        try 
        {
            const currentPlaces: CurrentDataProps[] = await CurrentData.find({room : Number(reqBodyJson.room)}).toArray();
            if (currentPlaces.length === 0)
            {
                ctx.response.status = 500;
                ctx.response.body = JSON.stringify({ error: "No such room exists" });
                return;
            }
            // nie ma takiego pokoju
            ctx.response.status = 201;
            ctx.response.body = JSON.stringify(currentPlaces);
            return; 

        } catch (error : any)
        {
            console.log("[ERROR POST ADD REQUEST] ", error.message);
            ctx.response.status = 500;
            ctx.response.body = JSON.stringify({ error: "Failed to load data" });
            return;
        }
    }
    else 
    {
        ctx.response.status = 404;
        ctx.response.body = JSON.stringify({ error: "Data not provided" });
        return;
    }
})
.post("/addReservations",async (ctx: Context) => {
    const reqBodyJson: { room : number, guest : string } = await ctx.request.body.json();
    console.log(reqBodyJson.room," |", reqBodyJson.guest);
    if (reqBodyJson.room && reqBodyJson.guest)
    {
    try {
        const ourGuest: GuestsProps[] = await Guests.find({guest: reqBodyJson.guest}).toArray();
        if (ourGuest.length === 0)
        {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({ error: "No such guest exists" });
            return;
        }
        // taki gosc istnieje
        const maxPlaces = await MaxData.find({room : Number(reqBodyJson.room)}).toArray();
        console.log(reqBodyJson.room);
        if (maxPlaces.length === 0)
        {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({ error: "No such room exists" });
            return;
        }
        // taki pokoj istnieje
        const currentPlaces : CurrentDataProps[]= await CurrentData.find({room : Number(reqBodyJson.room)}).toArray();

        if (currentPlaces[0].guests.filter(elem => elem == reqBodyJson.guest).length >= 1)
        {
            ctx.response.status = 401;
            ctx.response.body = JSON.stringify({ error: "Such reservation exists" });
            return;
        }

        if (currentPlaces[0].guests.length + 1 <= maxPlaces[0].number_of_places)
        {
            await CurrentData.updateOne(
            { room : Number(reqBodyJson.room) },
            { $push: { guests : reqBodyJson.guest } },
            );
            ctx.response.status = 201;
            ctx.response.body = JSON.stringify({ success: true })
            return;
        }
        else {
            ctx.response.status = 500;
            ctx.response.body = JSON.stringify({ error: "There is no space left in room" });
            return;
        }
    }
    catch (error : any)
    {
        console.log("[ERROR POST ADD REQUEST] ", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
        return;
    }
    }
    ctx.response.status = 404;
    ctx.response.body = JSON.stringify({ error: "Data not provided" });
    return;
})
.post("/deleteReservation", async (ctx: Context) => {
    const reqBodyJson: { room : number, guest : string } = await ctx.request.body.json();
    try {
    if (reqBodyJson.room && reqBodyJson.guest)
    {
        
        const ourGuest: GuestsProps[] = await Guests.find({guest: reqBodyJson.guest}).toArray();
        if (ourGuest.length === 0)
        {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({ error: "No such guest exists" });
            return;
        }
        console.log(reqBodyJson.guest);
        // taki gosc nie istnieje
        const maxPlaces = await MaxData.find({room : Number(reqBodyJson.room)}).toArray();
        console.log(reqBodyJson.room);
        if (maxPlaces.length === 0)
        {
            ctx.response.status = 400;
            ctx.response.body = JSON.stringify({ error: "No such room exists" });
            return;
        }
        // taki pokoj nie istnieje
        await CurrentData.updateOne(
            { room : Number(reqBodyJson.room) },
            { $pull: { guests : reqBodyJson.guest } },
        );
        ctx.response.status = 201;
        ctx.response.body = JSON.stringify({ success: true })
        return;
    }
    else
    {
        ctx.response.status = 404;
        ctx.response.body = JSON.stringify({ error: "Data not provided" });
        return;
    }
    } catch (error : any)
    {
        console.log("[ERROR DELETE REQUEST] ", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
        return;
    }
})
;

// Adding middlewares
app.use(logger.logger);
app.use(logger.responseTime);
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
    });
  } catch (_error : any) {
    console.log(_error.message);
    await next();
  }
});

// Making app to listen to port
console.log("App is listening to port: 8000");
await app.listen({ port: 8000 });