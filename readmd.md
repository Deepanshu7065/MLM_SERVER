## ElectircSql
ye real data ka ek copy rakhta hai jo client tak jata hai agar koi update hota hai tab bhi wo pehle electric sql me jata hai uske baad main database me 
isme agar client offline hai tabhi iska data acess kar sakta hai or update karega to bhi electric sql me jata hai uske baad main database me jata hai


ye backend or frontend dono me use hota hai

## Backend me 
 hum isko node js or docker dono me install kar sakte hai 
 man lo postgress humara 5432 par chla rha hai to electirc sql ko 5431 par ya kisi or port par chalate hai 


## folder structure
project/
├─ backend/
│  ├─ docker-compose.yml
│  └─ sql/
│     └─ schema.sql

schema.spl me humara database schema rakha hai
ye humara table data hai

    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      updated_at timestamptz DEFAULT now()
    );

 ab iske baad hum apna node server ya docker se start kar sakte hai


    async function start() {
     const server = createServer({
      databaseUrl: 'postgresql://postgres:mysecretpassword@localhost:5432/mydb',
      port: 5133,
      // optional: logLevel: 'debug'
    })
   }
 isse humara database connect ho jayga


 ab maan lo hume full table iska client ko nahi bhejna sirf kuch hi data dikhana hai to wo chij bhi isme handle kar sakte hai 
   export const shapes = {
    todosForUser: (userId) => ({
      table: "todos",
      where: { user_id: userId }
    })
  }

is tarah se

usme hum token verify karke bhi shapes ko access kar sakte hai or uska data bhej sakte hai matlab kis user ko kya dikhna chahiye to wo bhej sakte hai

iske fayde kuch aise hai 
- Postgres ke WAL se data replicate karta hai, alag se socket wagerh nahi likhna hota .
- Aapko manually APIs (GET/POST) likhne ki zarurat nahi — data sync automatic hota hai.
- Har client ke liye sirf uska apna  data sync hota hai (user_id, tenant_id ke basis pe).
- Client ke local DB me data sync hota hai, jisse writes or read easy hota hai.
- Postgres me network down hone par bhi clients kaam karte rahte hain (local-first).
- Cloud ke bina aap apne infra me host kar sakte ho.

WAL(Write Ahead Log) lya hota hai 
 Jab bhi Postgres me koi data change hota hai,
 to wo pehle ek WAL file (log) me likha jata hai —
 fir actual table update hoti hai.

process
- ek naye user ne ek nayi list add kiya
- electric sql wo data ko postgress me likhega
- ab uske baad wo WAL file create hoga usme likhega
- WAL me kiye hue change padhe 
- or us har client ko bhej dega jo jo is se connect hai


ye hume use karna chahiye jab aap 
- chat, 
- dashboard,
- heavy data 
- postgress me data store karte ho
- tanstack, react ka bhi use karte ho  

## Frontend me
 
 folder structure

 frontend/
├─ package.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ electric.ts
   └─ components/
      └─ TodoList.tsx

connection
add karo env me electircsql ka url 

    const electric = await Electric.connect(ELECTRIC_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

     export function todosForUserShape(userId: number) {
       return {
        name: 'todos_for_user',
        table: 'todos',
        where: { user_id: userId },
        // optional: columns: ['id','title','completed','updated_at']
       }
     }

  ye jake token ke jariye backend me shapes me data fetch karega or waha se bhejega 

  ye shapes bhjeta hai shapes hota hai sync configure 
  jisme hume batana hota hai ki kya bhejna hai 
  kon se table name hai 
  kon sa row chahiye 
  kon sa column chahiye 

  ye backend se frontend me data sync hota hai

     const shape = todosForUserShape(userId)
     <!-- ye shape nikalega userId ke token se  -->

     const db = await electric.syncShape(shape)
     frontend Electric client se request karta hai
     isme local db me data milta hai 

     const data = await db.findMany()
     findMany() se data fetch kar sakte ho
     Offline hone par bhi data available rahega.

  
  **data ko get karna or state me save karna 

  useEffect(() => {
    async function fetchData() {
      const data = await loadTodos(userId)
      setTodos(data)
    }
    fetchData()
  }, [userId])

  isse state me data ko save ho jayga or iske baad render kar sakte ho


  ab maan lo humare postgress me data change hua hai 
   const subscription = db.todos.liveMany().subscribe((todos) => {
     console.log('Updated todos:', todos)
     setTodos(todos)
   })

   ye livemany().subscribe se humara data change hota hai or iske baad frontend me update hota hai

Frontend me Electric client ek embedded Postgres clone (PGlite) run karta hai —
 - ye basically ek mini database hota hai jo browser me hi store hota hai (IndexedDB ke upar).
 - Ye database realtime update hota hai.
 - Agar internet chala jaye to bhi ye data hold karta hai.
 - Jab connection wapas aata hai → sync hota hai Electric backend se.
   
    import { electrify } from "@electric-sql/pglite"
    const db = await electrify('localdb', { url: 'ws://localhost:5133' })
    <!-- isme browser me ek localdb create karta hai  -->
    await db.todos.insert({ id: 1, title: 'New Order', user_id: 2 })
    <!-- ye data us localdb me insert hota hai  -->


** Use Cases
1. Order Management – Real-time Status Sync
- Salesperson ne ek order create kiya →
   Admin aur dispatch team dono ko instantly updated order dikhe.
ElectricSQL benefit:
- “orders” table ko ElectricSQL se sync kara do.
- Har client (sales, admin) ko usi time update milta hai
   where: { branch_id: currentBranchId }
   <!-- Har branch apna order data hi dekhe. -->


2. Vehicle Tracking 
Jab vehicle assign hota hai aur uske status (Loading → In Transit → Delivered) badalte hain.
ElectricSQL benefit
- “vehicles” table + “vehicle_status_logs” table sync karao.
- Dispatch team change kare to driver app / admin dashboard dono update ho jaayein.
- Offline driver bhi status update kare to later auto-sync ho jaayega 

3. Price Update
jese humare product ka price change hota rehta hai
Electric Sql 
- All branches, agents, dealers ke screens me instantly naya rate dikhe.
- “product_prices” table ko global sync me rakho.
- Har client me rate list local DB me rahe, fast open hoti hai.
- Agar internet nahi hai to purana rate visible, net aate hi refresh.

4. Offline Field App (Sales / team)
- Network nahi hai → Local me save ho jaaye → Online hote hi sync.
- ElectricSQL benefit
- Local DB  me data offline store hota hai.
- ElectricSQL backend ke sath reconnect hote hi sync ho jaata hai.
- koi manually logic nahi likhna

6. Dashboard (Real-time)
- Admin dashboard me live sales, orders, etc dikhe.
- ElectricSQL reactive TanStack DB ke sath integrate ho sakta hai.
- Graphs auto-update ho jaate hain jab data change hota hai.
