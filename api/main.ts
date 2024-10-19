import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { collection, getFirestore, addDoc, setDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  // replace with your own config
};

const firebaseApp = initializeApp(firebaseConfig, "star-wars-api");

const db = getFirestore(firebaseApp)

const app = new Application();

const router = new Router();

router
.get('/', (ctx) => {
  ctx.response.body = 'Hello from our API! 🦕'
})
.get('/people', async (ctx) => {
  try {
    const people = await getDocs(collection(db, "people"));
    const data = people.docs.map((doc) => doc.data());
    ctx.response.body = data
  } catch (e) {
    console.log(e)
    ctx.response.body = "Something went wrong :("
  }
})
.get('/people/:slug', async (ctx) => {
  const {slug} = ctx.params;
  try {
    // const person = people.find((person) => person.slug === slug);
    const peopleRef = collection(db, 'people')
    const q = query(peopleRef, where("slug", "==", slug));

    const person = await getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => doc.data());
      return data[0];
    })
    if(person) {
      ctx.response.body = person;
    } else {
      ctx.response.body = 'That person was not found 😭'
    }
  } catch (e) {
    console.log(e)
    ctx.response.body = "Something went wrong :("
  }
})
.post('/people', async (ctx) => {
  const { slug, name, homeWorld, profileURL } = await ctx.request.body('json').value
  const person = {
    name,
    homeWorld,
    profileURL,
    slug,
  }
  if(person) {
    // await addDoc(collection(db, 'people'), person);
    await setDoc(doc(db, 'people', slug), person)
    ctx.response.body = 'Person added to Firebase 🔥'
  } else {
    ctx.response.body = "Person not added 😭"
  }
})

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', () => {
  console.log('App is running on http://localhost:8000');
})

app.use();

await app.listen({port: 8000})