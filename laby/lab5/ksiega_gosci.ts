/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */
import { Application, Context, Router } from "jsr:@oak/oak/";
import { Eta } from "https://deno.land/x/eta/src/index.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
import { readLines } from "https://deno.land/std@0.208.0/io/mod.ts";

// Initiate app
const app: Application  = new Application();
const router: Router = new Router({
  //prefix: "/admin",
});
const eta: Eta = new Eta({ views: `${Deno.cwd()}/views` });

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

interface DataItem {
  name?: string;
  body?: string;
}

// Creating Routes
router
  .get("/", (ctx: Context) => {
    const res: string = eta.render("./ks_gosci", { // tu przekazujemy do pliczkow .eta
      title: "Ksiega gosci",
    });
    ctx.response.body = res;
  })
  .post("/", async (ctx: Context) => {
    // const reqBodyForm: URLSearchParams = await ctx.request.body.form();
    // // ctx.response.type = 'text/html'
    // ctx.response.body = `Hello '${reqBodyForm.get("name")}'`
    // nie destrukturyzuje sie

    const reqBodyJson: { name?: string; body?: string } = await ctx.request.body.json(); // pobiera jsona

    const written_data : DataItem = 
    {
        name : reqBodyJson.name,
        body : reqBodyJson.body
    } 

    if (!written_data.name || !written_data.body) 
        {
        ctx.response.status = 400;
        ctx.response.body = JSON.stringify({ error: "Name and body are required" });
        return;
    }

    try 
    {

    await Deno.writeTextFile("./ksiega_gosci.txt", `${written_data.name}:${written_data.body}\n`, { append: true }); // zwraca void

    ctx.response.status = 201;
    ctx.response.body = JSON.stringify({ success: true })

    } catch (error : any) 
    {
        console.error("Failed to read file:", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
    }

  })
  .get("/load", async (ctx: Context) => {
    try {
        const file : Deno.FsFile = await Deno.open("./ksiega_gosci.txt");
        const data : DataItem[] = [];
        for await (const line of readLines(file)) 
        {
            if (line.trim())
            {
                const [name, body] = line.split(':');
                data.push({name : name, body : body });
            }
        }
        file.close();
        ctx.response.status = 201;
        ctx.response.body = JSON.stringify(data) ;
    }
    catch (error : any)
    {
        console.error("Failed to read file:", error.message);
        ctx.response.status = 500;
        ctx.response.body = JSON.stringify({ error: "Failed to load data" });
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