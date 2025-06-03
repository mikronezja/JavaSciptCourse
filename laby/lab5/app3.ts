import { Application, Context, Router, RouterContext  } from "jsr:@oak/oak/";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
// import { privateEncrypt } from "node:crypto";
import{MongoClient, Collection, Db} from "npm:mongodb@6.16.0";

const MONGODB_URI = "mongodb://localhost:27017/";
const DB_NAME = "AGH";

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

const db : Db = client.db(DB_NAME);
const students : Collection<Data> = db.collection("students");


// Zawiera zakodowaną na stałe tablicę obiektów o nazwie students
// let students = [
//       {
//             fname: 'Jan',
//             lname: 'Kowalski',
//             faculty: 'WI'
//       },
//       {
//             fname: 'Anna',
//             lname: 'Nowak',
//             faculty: 'WMS'
//       },
//       {
//             fname: 'Tomasz',
//             lname: 'Zieliński',
//             faculty: 'WZ'
//       },
//       {
//             fname: 'Katarzyna',
//             lname: 'Mazur',
//             faculty: 'WMS'
//       },
//       {
//             fname: 'Michał',
//             lname: 'Dąbrowski',
//             faculty: 'WIMIP'
//       },
//       {
//             fname: 'Julia',
//             lname: 'Wójcik',
//             faculty: 'WI'
//       },
//       {
//             fname: 'Piotr',
//             lname: 'Szymański',
//             faculty: 'WIET'
//       },
//       {
//             fname: 'Natalia',
//             lname: 'Kubiak',
//             faculty: 'WIET'
//       },
//       {
//             fname: 'Łukasz',
//             lname: 'Pawlak',
//             faculty: 'WIMIC'
//       },
//       {
//             fname: 'Aleksandra',
//             lname: 'Król',
//             faculty: 'WGGIOŚ'
//       }
// ];
// Skrypt przekazuje tablicę do widoku, a widok wyświetla otrzymane dane w formie następującej tabeli HTML

// Initiate app
const app: Application  = new Application();
const router: Router = new Router({
  //prefix: "/admin",
});
const eta: Eta = new Eta({ views: `${Deno.cwd()}/views` });

interface Data 
{
    fname : string,
    lname : string,
    faculty : string,
}


// Allowing static file to fetch from server
/*
app.use(async (ctx: Context, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});
*/

// Creating Routes
router
.get("/", (ctx: Context) => {
    const res: string = eta.render("./not_found", {title: "NOT FOUND"});
    ctx.response.body = res;
  })
.get("/:faculty", async (ctx: RouterContext<"/:faculty">) => {
    const faculty : string = ctx.params.faculty;
    if (!faculty) {
    ctx.response.status = 400;
    ctx.response.body = "Faculty parameter is required.";
    return;
    }
    const table: Data[] = await students.find({faculty: faculty}).toArray();
    try
    {
    const res : string = await eta.render("./studenci", { students: table });
    ctx.response.body = res;
    }
    catch (error : any)
    {
        console.log("ERROR", error.message);
        ctx.response.status = 500;
        ctx.response.body = "Internal server error";
    }
});

// Adding middlewares
app.use(logger.logger);
app.use(logger.responseTime);
app.use(router.routes());
app.use(router.allowedMethods());

// Making app to listen to port
console.log("App is listening to port: 8000");
await app.listen({ port: 8000 });