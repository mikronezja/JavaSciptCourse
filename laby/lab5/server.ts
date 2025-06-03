import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

const router = new Router();

router.get("/", (ctx) => { // ctx - context object
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head><title>Hello oak!</title><head>
      <body>
        <h1>Hello oak!</h1>
      </body>
    </html>
  `; // tworzy taki response
});

const app = new Application(); // tworzymy aplikacje:)
const port = 8080; // tworzymy port na ktorym beda wysluchiwane nasze requesty

app.use(router.routes()); // przypisa do aplikacji glownej mozliwe 'sciezki' tu GET /
app.use(router.allowedMethods()); // automatycznie zajmuje sie walidacją i dla tych metod ktorymi sie nie zajmujemy 
// wysyla odpowiednie statusy
console.log(`Server running on http://localhost:${port}`);

app.listen({ port: port }); // oczekuje na req przez port 
