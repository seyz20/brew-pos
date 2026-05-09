import { useState, useEffect } from "react";

// ─── Storage ──────────────────────────────────────────────────
const store={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};

// ─── Helpers ──────────────────────────────────────────────────
const fmt=(n)=>`₱${Number(n).toFixed(2)}`;
const uid=()=>Math.random().toString(36).slice(2,9).toUpperCase();
const fmtTime=(ts)=>new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const fmtDate=(ts)=>new Date(ts).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
const fmtDateTime=(ts)=>new Date(ts).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

// Categories that support size variants
const SIZE_CATS=["Coffee","Tea","Cold Drinks"];
const SIZES=[
  {label:"S",name:"Small", multiplier:1},
  {label:"M",name:"Medium",multiplier:1.25},
  {label:"L",name:"Large", multiplier:1.5},
];

// Add-on definitions
const DEFAULT_ADDONS=[
  {id:"a1",name:"Whipped Cream",  price:29,  emoji:"🍦",category:"Topping"},
  {id:"a2",name:"Popping Boba",   price:39,  emoji:"🫧",category:"Topping"},
  {id:"a3",name:"Tapioca Pearls", price:35,  emoji:"🧋",category:"Topping"},
  {id:"a4",name:"Coconut Jelly",  price:29,  emoji:"🥥",category:"Topping"},
  {id:"a5",name:"Coffee Jelly",   price:35,  emoji:"☕",category:"Topping"},
  {id:"a6",name:"Nata de Coco",   price:29,  emoji:"🍮",category:"Topping"},
  {id:"a7",name:"Extra Espresso", price:45,  emoji:"⚡",category:"Shot"},
  {id:"a8",name:"Oat Milk",       price:40,  emoji:"🌾",category:"Milk"},
  {id:"a9",name:"Almond Milk",    price:40,  emoji:"🌰",category:"Milk"},
  {id:"a10",name:"Sugar-Free Syrup",price:29,emoji:"🍬",category:"Syrup"},
  {id:"a11",name:"Caramel Drizzle",price:29, emoji:"🍯",category:"Syrup"},
  {id:"a12",name:"Vanilla Syrup", price:29,  emoji:"🌿",category:"Syrup"},
];

// ─── Default Menu (all prices 29-149) ─────────────────────────
const DEFAULT_MENU=[
  // Coffee — base = Small price
  {id:1, name:"Espresso",      category:"Coffee",      basePrice:49,  desc:"Double shot, rich & bold",           emoji:"☕"},
  {id:2, name:"Flat White",    category:"Coffee",      basePrice:69,  desc:"Velvety microfoam, house blend",     emoji:"☕"},
  {id:3, name:"Cappuccino",    category:"Coffee",      basePrice:69,  desc:"Equal parts espresso, steam, foam",  emoji:"☕"},
  {id:4, name:"Latte",         category:"Coffee",      basePrice:75,  desc:"Silky steamed milk, double shot",    emoji:"☕"},
  {id:5, name:"Cold Brew",     category:"Coffee",      basePrice:79,  desc:"12-hour steep, smooth finish",       emoji:"🧊"},
  {id:6, name:"Americano",     category:"Coffee",      basePrice:55,  desc:"Espresso + hot water",               emoji:"☕"},
  {id:7, name:"Mocha",         category:"Coffee",      basePrice:79,  desc:"Espresso, chocolate, steamed milk",  emoji:"☕"},
  {id:8, name:"Caramel Macchiato",category:"Coffee",   basePrice:85,  desc:"Vanilla, steamed milk, caramel",     emoji:"☕"},
  // Tea
  {id:9, name:"Matcha Latte",  category:"Tea",         basePrice:79,  desc:"Ceremonial grade, oat milk",         emoji:"🍵"},
  {id:10,name:"Chai Latte",    category:"Tea",         basePrice:69,  desc:"House spice blend, steamed milk",    emoji:"🍵"},
  {id:11,name:"Earl Grey",     category:"Tea",         basePrice:49,  desc:"Classic bergamot, loose leaf",       emoji:"🍵"},
  {id:12,name:"Hojicha",       category:"Tea",         basePrice:65,  desc:"Roasted green tea, nutty notes",     emoji:"🍵"},
  {id:13,name:"Taro Milk Tea", category:"Tea",         basePrice:75,  desc:"Creamy taro, house milk tea",        emoji:"🍵"},
  {id:14,name:"Brown Sugar Milk Tea",category:"Tea",   basePrice:79,  desc:"Tiger stripes, fresh milk",          emoji:"🍵"},
  // Cold Drinks
  {id:15,name:"Iced Matcha",   category:"Cold Drinks", basePrice:79,  desc:"Shaken with oat milk & ice",         emoji:"🥤"},
  {id:16,name:"Lemonade",      category:"Cold Drinks", basePrice:55,  desc:"Freshly squeezed, house-made",       emoji:"🍋"},
  {id:17,name:"Fresh OJ",      category:"Cold Drinks", basePrice:65,  desc:"Pressed to order",                   emoji:"🍊"},
  {id:18,name:"Sparkling H₂O", category:"Cold Drinks", basePrice:39,  desc:"Imported sparkling water",           emoji:"💧"},
  {id:19,name:"Mango Soda",    category:"Cold Drinks", basePrice:59,  desc:"Fresh mango, sparkling water",       emoji:"🥭"},
  // Pastry
  {id:20,name:"Croissant",     category:"Pastry",      basePrice:55,  desc:"Butter laminated, flaky layers",     emoji:"🥐"},
  {id:21,name:"Pain au Choc",  category:"Pastry",      basePrice:65,  desc:"Dark chocolate, house-baked",        emoji:"🥐"},
  {id:22,name:"Banana Bread",  category:"Pastry",      basePrice:49,  desc:"Walnut & cinnamon, vegan",           emoji:"🍞"},
  {id:23,name:"Almond Tart",   category:"Pastry",      basePrice:75,  desc:"Frangipane, seasonal fruit",         emoji:"🥧"},
  // Snacks
  {id:24,name:"Avocado Toast", category:"Snacks",      basePrice:99,  desc:"Sourdough, chilli flake, EVOO",      emoji:"🥑"},
  {id:25,name:"Cheese Scone",  category:"Snacks",      basePrice:49,  desc:"Mature cheddar, herb butter",        emoji:"🧀"},
  {id:26,name:"Granola Bar",   category:"Snacks",      basePrice:39,  desc:"Oat, honey, mixed seeds",            emoji:"🌾"},
];

// Helper: compute price for a size
const sizePrice=(basePrice,sizeIdx)=>Math.round(basePrice*SIZES[sizeIdx].multiplier);

const T0=Date.now();
const DEFAULT_SALES=[
  {id:"s1",orderNum:1,items:[{id:1,name:"Espresso",size:"Small",basePrice:49,price:49,addons:[],qty:2},{id:20,name:"Croissant",size:null,basePrice:55,price:55,addons:[],qty:1}],subtotal:153,discount:0,total:153,voucher:null,ts:T0-3600000*5,note:""},
  {id:"s2",orderNum:2,items:[{id:4,name:"Latte",size:"Large",basePrice:75,price:113,addons:[{id:"a1",name:"Whipped Cream",price:29}],qty:1},{id:9,name:"Matcha Latte",size:"Medium",basePrice:79,price:99,addons:[],qty:1}],subtotal:241,discount:0,total:241,voucher:null,ts:T0-3600000*4,note:""},
  {id:"s3",orderNum:3,items:[{id:2,name:"Flat White",size:"Medium",basePrice:69,price:86,addons:[{id:"a2",name:"Popping Boba",price:39}],qty:2}],subtotal:250,discount:25,total:225,voucher:"SUMMER10",ts:T0-3600000*3,note:"Less ice"},
  {id:"s4",orderNum:4,items:[{id:24,name:"Avocado Toast",size:null,basePrice:99,price:99,addons:[],qty:1},{id:6,name:"Americano",size:"Small",basePrice:55,price:55,addons:[],qty:1}],subtotal:154,discount:0,total:154,voucher:null,ts:T0-3600000*2,note:""},
  {id:"s5",orderNum:5,items:[{id:5,name:"Cold Brew",size:"Large",basePrice:79,price:119,addons:[{id:"a3",name:"Tapioca Pearls",price:35}],qty:2},{id:22,name:"Banana Bread",size:null,basePrice:49,price:49,addons:[],qty:1}],subtotal:321,discount:50,total:271,voucher:"BDAY50",ts:T0-3600000,note:"No nuts"},
];

const DEFAULT_VOUCHERS=[
  {id:"v1",code:"SUMMER10",type:"percent",value:10,desc:"Summer 10% off",minOrder:0,   active:true,usageLimit:100,used:1},
  {id:"v2",code:"BDAY50",  type:"fixed",  value:50, desc:"Birthday ₱50 off",minOrder:200,active:true,usageLimit:50, used:1},
  {id:"v3",code:"WELCOME", type:"percent",value:15, desc:"New customer 15% off",minOrder:0,active:false,usageLimit:1, used:0},
];

const CATS=["All","Coffee","Tea","Pastry","Cold Drinks","Snacks"];
// Suggested categories shown as tag pills in the product form
const SUGGESTED_CATS=[
  {label:"Coffee",     emoji:"☕"},
  {label:"Tea",        emoji:"🍵"},
  {label:"Cold Drinks",emoji:"🥤"},
  {label:"Pastry",     emoji:"🥐"},
  {label:"Snacks",     emoji:"🌾"},
  {label:"Rice Meals", emoji:"🍚"},
  {label:"Sandwiches", emoji:"🥪"},
  {label:"Pasta",      emoji:"🍝"},
  {label:"Burgers",    emoji:"🍔"},
  {label:"Pizza",      emoji:"🍕"},
  {label:"Salads",     emoji:"🥗"},
  {label:"Soups",      emoji:"🍜"},
  {label:"Pika-Pika",  emoji:"🍿"},
  {label:"Desserts",   emoji:"🍦"},
  {label:"Breakfast",  emoji:"🥞"},
  {label:"Sideorders", emoji:"🍟"},
  {label:"Combos",     emoji:"🍱"},
  {label:"Shakes",     emoji:"🧃"},
  {label:"Juices",     emoji:"🍊"},
  {label:"Alcohol",    emoji:"🍺"},
  {label:"Specials",   emoji:"⭐"},
];
const CAT_EMOJI={All:"🍽️",Coffee:"☕",Tea:"🍵",Pastry:"🥐","Cold Drinks":"🥤",Snacks:"🌾"};
const ADDON_CATS=["All","Topping","Shot","Milk","Syrup"];
const EMOJIS=["☕","🍵","🥐","🧁","🥤","💧","🍊","🌾","🥑","🧀","🥧","🍞","🧊","🍰","🫖","🥗","🧃","🫙","🍫","🌮","🍋","🥭","🧋","🍦","🍩","🍪","🧇","🥞","🍜","🍝","🍛","🍚","🍲","🍱","🥙","🫔","🌯","🥗","🍔","🌽","🫛","🥬","🫑","🥕","🍠","🫚","🥜","🫘","🍇","🍓","🫐","🍒","🍑","🥝","🍍","🥥","🍌","🍉","🍈","🍄","🫚","🧆","🥚","🍳","🫕","🍤","🍗","🍖","🌭","🥓","🥩","🧈","🍿","🥨","🧂","🫙","🧋","🍶","🥛","🍼","☕","🫗","🍹","🍸","🥂","🍾","🧉","🍺","🫖","🍵"];

// ─── CSS ──────────────────────────────────────────────────────
const GCSS=`
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Pacifico&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;width:100%;}
body{font-family:'Nunito',sans-serif;overflow:hidden;}
input,textarea,select,button{font-family:'Nunito',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.1);}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.4);border-radius:3px;}
@keyframes blob1{0%,100%{transform:translate(0,0)scale(1);}33%{transform:translate(30px,-20px)scale(1.05);}66%{transform:translate(-20px,15px)scale(.97);}}
@keyframes blob2{0%,100%{transform:translate(0,0)scale(1);}33%{transform:translate(-25px,20px)scale(1.04);}66%{transform:translate(18px,-12px)scale(.98);}}
@keyframes blob3{0%,100%{transform:translate(0,0)scale(1);}50%{transform:translate(20px,-25px)scale(1.06);}}
@keyframes pop{0%{transform:scale(0.6);opacity:0;}70%{transform:scale(1.12);}100%{transform:scale(1);opacity:1;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-6px);}40%,80%{transform:translateX(6px);}}
@keyframes slideIn{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
`;

// ─── Design tokens ────────────────────────────────────────────
const glass=(a=0.28,b=18,ba=0.35)=>({
  background:`rgba(255,255,255,${a})`,
  backdropFilter:`blur(${b}px)`,WebkitBackdropFilter:`blur(${b}px)`,
  border:`1px solid rgba(255,255,255,${ba})`,
});
const CORAL="#FF6B6B",ORANGE="#FF8C42",YELLOW="#FFD166",MINT="#06D6A0",SKY="#118AB2";
const TEXT="#2D1B0E",TEXTM="#8A6A4E",TEXTL="#C4A882";

// ─── Background ───────────────────────────────────────────────
function SummerBg(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",background:"linear-gradient(145deg,#FFEED4 0%,#FFCF96 40%,#FFAA6A 75%,#FF8C42 100%)"}}>
      {[{w:580,h:580,bg:"rgba(255,107,107,0.35)",t:-140,l:-150,a:"blob1 10s ease-in-out infinite"},{w:450,h:450,bg:"rgba(255,209,102,0.40)",t:40,r:-90,a:"blob2 13s ease-in-out infinite"},{w:380,h:380,bg:"rgba(6,214,160,0.20)",b:60,l:"28%",a:"blob3 15s ease-in-out infinite"},{w:300,h:300,bg:"rgba(255,140,66,0.28)",b:-70,r:"12%",a:"blob1 9s ease-in-out infinite 2s"},{w:220,h:220,bg:"rgba(255,168,128,0.32)",t:"42%",l:"16%",a:"blob2 11s ease-in-out infinite 1s"}].map((b,i)=>(
        <div key={i} style={{position:"absolute",width:b.w,height:b.h,borderRadius:"50%",background:b.bg,top:b.t,left:b.l,right:b.r,bottom:b.b,animation:b.a}}/>
      ))}
    </div>
  );
}

// ─── Dark Background ──────────────────────────────────────────
function DarkBg(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",background:"linear-gradient(145deg,#1a0a2e 0%,#16213e 35%,#0f3460 70%,#1a1a2e 100%)"}}>
      {[
        {w:500,h:500,bg:"rgba(138,43,226,0.20)",t:-100,l:-130,a:"blob1 12s ease-in-out infinite"},
        {w:400,h:400,bg:"rgba(255,107,107,0.12)",t:60,r:-80,a:"blob2 14s ease-in-out infinite"},
        {w:350,h:350,bg:"rgba(6,214,160,0.10)",b:40,l:"25%",a:"blob3 16s ease-in-out infinite"},
        {w:280,h:280,bg:"rgba(17,138,178,0.15)",b:-50,r:"10%",a:"blob1 10s ease-in-out infinite 2s"},
        {w:200,h:200,bg:"rgba(255,209,102,0.08)",t:"38%",l:"14%",a:"blob2 12s ease-in-out infinite 1s"},
      ].map((b,i)=>(
        <div key={i} style={{position:"absolute",width:b.w,height:b.h,borderRadius:"50%",
          background:b.bg,top:b.t,left:b.l,right:b.r,bottom:b.b,animation:b.a,
          filter:"blur(2px)"}}/>
      ))}
      {/* Starfield dots */}
      {Array.from({length:40},(_,i)=>(
        <div key={"s"+i} style={{
          position:"absolute",
          width:i%5===0?3:i%3===0?2:1.5,
          height:i%5===0?3:i%3===0?2:1.5,
          borderRadius:"50%",
          background:`rgba(255,255,255,${0.2+Math.random()*0.5})`,
          top:`${Math.random()*100}%`,
          left:`${Math.random()*100}%`,
          animation:`pulse ${2+Math.random()*3}s ease-in-out infinite ${Math.random()*2}s`,
        }}/>
      ))}
    </div>
  );
}


function Clock(){
  const [t,setT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i);},[]);
  return <span style={{fontVariantNumeric:"tabular-nums",fontSize:13,color:TEXTM,fontWeight:700}}>{t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>;
}

function Toast({msg}){
  return <div style={{position:"fixed",bottom:22,left:"50%",transform:`translateX(-50%) translateY(${msg?0:12}px)`,...glass(0.9,20,0.6),borderRadius:12,padding:"10px 24px",fontSize:14,fontWeight:800,color:TEXT,opacity:msg?1:0,transition:"all 260ms ease",zIndex:9999,pointerEvents:"none",whiteSpace:"nowrap",boxShadow:"0 8px 28px rgba(255,107,107,0.22)"}}>{msg||""}</div>;
}

function GlassInput({value,onChange,placeholder,type="text",style={}}){
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{...glass(0.45,12,0.5),borderRadius:9,padding:"9px 13px",fontSize:14,color:TEXT,fontWeight:600,width:"100%",...style,outline:"none"}}/>;
}

function GlassBtn({children,onClick,variant="primary",style={},disabled=false}){
  const vs={
    primary:{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",border:"none",boxShadow:"0 4px 16px rgba(255,107,107,0.35)"},
    secondary:{...glass(0.45,10,0.5),color:TEXT},
    danger:{background:"rgba(220,50,50,0.82)",color:"#fff",border:"none"},
    success:{background:`linear-gradient(135deg,${MINT},${SKY})`,color:"#fff",border:"none",boxShadow:"0 4px 14px rgba(6,214,160,0.30)"},
  };
  return <button onClick={onClick} disabled={disabled} style={{padding:"9px 18px",borderRadius:10,fontWeight:800,fontSize:14,cursor:disabled?"not-allowed":"pointer",transition:"all 160ms ease",opacity:disabled?0.5:1,...vs[variant],...style}}>{children}</button>;
}

function CatPill({label,active,onClick}){
  return <button onClick={onClick} style={{padding:"5px 14px",borderRadius:20,cursor:"pointer",fontWeight:700,fontSize:12,transition:"all 140ms ease",...(active?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",border:"none",boxShadow:"0 3px 10px rgba(255,107,107,0.30)"}:{...glass(0.35,8,0.40),border:"none",color:TEXTM})}}>{label}</button>;
}

// ─── Item Customizer Modal ────────────────────────────────────
function ItemCustomizer({item,addons,onConfirm,onClose}){
  // ── Resolve available sizes from ANY source ──────────────────
  // Priority 1: explicit variants array saved on the item
  // Priority 2: item.useVariants flag with basePrice fallback
  // Priority 3: legacy SIZE_CATS category check (old default items)
  // Priority 4: no sizes — single price item
  const availableSizes=(()=>{
    // Explicit variant prices stored on item
    if(item.variants&&item.variants.length>0){
      const enabled=item.variants.filter(v=>v.enabled!==false&&Number(v.price)>0);
      if(enabled.length>0) return enabled.map(v=>({size:v.size,price:Number(v.price)}));
    }
    // useVariants flag set but no variants array (shouldn't happen but guard it)
    if(item.useVariants&&item.basePrice>0){
      return SIZES.map((s,i)=>({size:s.name,price:sizePrice(item.basePrice,i)}));
    }
    // Legacy: old default menu items whose category is in SIZE_CATS
    if(SIZE_CATS.includes(item.category)){
      return SIZES.map((s,i)=>({size:s.name,price:sizePrice(item.basePrice,i)}));
    }
    return [];
  })();

  const hasSize=availableSizes.length>0;
  const [sizeIdx,setSizeIdx]=useState(0);
  const [selectedAddons,setSelectedAddons]=useState([]);
  const [addonTab,setAddonTab]=useState("All");

  const toggleAddon=(addon)=>{
    setSelectedAddons(p=>p.find(a=>a.id===addon.id)?p.filter(a=>a.id!==addon.id):[...p,{...addon}]);
  };

  const basePrice=hasSize?availableSizes[sizeIdx].price:item.basePrice;
  const addonTotal=selectedAddons.reduce((a,x)=>a+x.price,0);
  const lineTotal=basePrice+addonTotal;

  const filteredAddons=addons.filter(a=>addonTab==="All"||a.category===addonTab);

  const confirm=()=>{
    onConfirm({
      menuId:item.id,
      name:item.name,
      emoji:item.emoji,
      category:item.category,
      basePrice:item.basePrice,
      size:hasSize?availableSizes[sizeIdx].size:null,
      price:lineTotal,
      addons:selectedAddons,
    });
    onClose();
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(5px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{...glass(0.88,28,0.6),borderRadius:24,width:"100%",maxWidth:460,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"slideIn 220ms ease"}}>
        {/* Header */}
        <div style={{padding:"18px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.3)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{...glass(0.5,8,0.4),borderRadius:14,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{item.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:17,color:TEXT}}>{item.name}</div>
              <div style={{fontSize:12,color:TEXTM}}>{item.desc}</div>
            </div>
            <button onClick={onClose} style={{...glass(0.4,8,0.4),border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:TEXTM,fontWeight:800}}>✕</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
          {/* Size / Variant selector */}
          {hasSize&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                Size {availableSizes.length>1?<span style={{fontWeight:600,color:TEXTL}}>({availableSizes.length} options)</span>:""}
              </div>
              <div style={{display:"flex",gap:8}}>
                {availableSizes.map((s,i)=>(
                  <button key={s.size} onClick={()=>setSizeIdx(i)} style={{
                    flex:1,padding:"10px 6px",borderRadius:12,cursor:"pointer",fontWeight:800,fontSize:13,transition:"all 150ms",
                    ...(sizeIdx===i
                      ?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",border:"none",boxShadow:"0 4px 12px rgba(255,107,107,0.30)"}
                      :{...glass(0.4,8,0.4),border:"none",color:TEXTM})}}>
                    <div style={{fontSize:18,marginBottom:2}}>{s.size[0]}</div>
                    <div style={{fontSize:12}}>{s.size}</div>
                    <div style={{fontSize:11,marginTop:2,opacity:0.88}}>{fmt(s.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          <div>
            <div style={{fontSize:11,fontWeight:800,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Add-ons</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {ADDON_CATS.map(c=><CatPill key={c} label={c} active={addonTab===c} onClick={()=>setAddonTab(c)}/>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {filteredAddons.map(addon=>{
                const sel=selectedAddons.find(a=>a.id===addon.id);
                return(
                  <button key={addon.id} onClick={()=>toggleAddon(addon)} style={{
                    display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:12,cursor:"pointer",
                    textAlign:"left",transition:"all 150ms",
                    ...(sel?{background:`linear-gradient(135deg,rgba(6,214,160,0.25),rgba(17,138,178,0.20))`,border:"1.5px solid rgba(6,214,160,0.5)"}:{...glass(0.38,8,0.38),border:"1px solid transparent"})}}>
                    <span style={{fontSize:18}}>{addon.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:12,color:TEXT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{addon.name}</div>
                      <div style={{fontSize:11,color:sel?MINT:TEXTM,fontWeight:700}}>+{fmt(addon.price)}</div>
                    </div>
                    {sel&&<div style={{width:18,height:18,borderRadius:"50%",background:`linear-gradient(135deg,${MINT},${SKY})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:900}}>✓</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"14px 20px 18px",borderTop:"1px solid rgba(255,255,255,0.3)",flexShrink:0}}>
          {selectedAddons.length>0&&(
            <div style={{fontSize:12,color:TEXTM,fontWeight:600,marginBottom:8}}>
              Add-ons: {selectedAddons.map(a=>a.name).join(", ")}
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:TEXTM,fontWeight:600}}>
                {hasSize?availableSizes[sizeIdx].size:"One size"} · {fmt(basePrice)}
                {addonTotal>0?` + ${fmt(addonTotal)} add-ons`:""}
              </div>
              <div style={{fontSize:20,fontWeight:900,color:CORAL}}>{fmt(lineTotal)}</div>
            </div>
            <GlassBtn onClick={confirm} style={{padding:"11px 24px",fontSize:15}}>Add to Order →</GlassBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: POS ─────────────────────────────────────────────
function POSSection({menu,addons,cart,setCart,posName}){
  const [cat,setCat]=useState("All");
  const [q,setQ]=useState("");
  const [hov,setHov]=useState(null);
  const [customizing,setCustomizing]=useState(null);

  const filtered=menu.filter(i=>(cat==="All"||i.category===cat)&&i.name.toLowerCase().includes(q.toLowerCase()));
  // Auto-reset tab if its category no longer exists in menu
  useEffect(()=>{
    if(cat!=="All"){
      const exists=menu.some(m=>m.category===cat);
      if(!exists) setCat("All");
    }
  },[menu,cat]);

  const handleAdd=(item)=>{ setCustomizing(item); };

  const confirmAdd=(cartItem)=>{
    const key=`${cartItem.menuId}_${cartItem.size}_${cartItem.addons.map(a=>a.id).join("+")}`;
    setCart(p=>({...p,[key]:{...cartItem,key,qty:(p[key]?.qty||0)+1}}));
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"14px 18px 10px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:10}}>
          <span style={{fontFamily:"'Pacifico',cursive",fontSize:20,color:TEXT}}>{posName}</span>
          <GlassInput value={q} onChange={e=>setQ(e.target.value)} placeholder="Search menu…" style={{width:180}}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{/* Dynamic category tabs — derived from actual menu + always includes All */}
          {(()=>{
            const menuCats=[...new Set(menu.map(m=>m.category))].filter(Boolean).sort();
            const allCats=["All",...menuCats];
            return allCats.map(c=>{
              const sug=SUGGESTED_CATS.find(s=>s.label===c);
              const emoji=CAT_EMOJI[c]||(sug?sug.emoji:"📦");
              // Reset to "All" if the current active category was removed from menu
              return <CatPill key={c} label={`${emoji} ${c}`} active={cat===c} onClick={()=>setCat(c)}/>;
            });
          })()}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"4px 18px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(158px,1fr))",gap:10,alignContent:"start"}}>
        {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:"32px 0",textAlign:"center",color:TEXTM,fontWeight:600}}>No items for "{q}"</div>}
        {filtered.map((item,idx)=>{
          const isHov=hov===item.id;
          // Resolve whether this item has size variants — same logic as ItemCustomizer
          const itemSizes=(()=>{
            if(item.variants&&item.variants.length>0){
              const en=item.variants.filter(v=>v.enabled!==false&&Number(v.price)>0);
              if(en.length>0) return en.map(v=>({size:v.size,price:Number(v.price)}));
            }
            if(item.useVariants&&item.basePrice>0) return SIZES.map((s,i)=>({size:s.name,price:sizePrice(item.basePrice,i)}));
            if(SIZE_CATS.includes(item.category)) return SIZES.map((s,i)=>({size:s.name,price:sizePrice(item.basePrice,i)}));
            return [];
          })();
          const hasSize=itemSizes.length>0;
          const minPrice=hasSize?Math.min(...itemSizes.map(s=>s.price)):item.basePrice;
          const maxPrice=hasSize?Math.max(...itemSizes.map(s=>s.price)):item.basePrice;
          return(
            <div key={item.id} onMouseEnter={()=>setHov(item.id)} onMouseLeave={()=>setHov(null)} onClick={()=>handleAdd(item)}
              style={{...glass(isHov?0.50:0.32,isHov?22:16,isHov?0.55:0.38),borderRadius:16,padding:"13px 11px",cursor:"pointer",position:"relative",
                transform:isHov?"translateY(-4px) scale(1.025)":"translateY(0) scale(1)",transition:"all 190ms ease",
                animation:`fadeUp 280ms ease ${Math.min(idx,12)*28}ms both`,boxShadow:isHov?"0 8px 28px rgba(255,107,107,0.18)":"0 2px 8px rgba(0,0,0,0.04)"}}>
              {hasSize&&(
                <div style={{position:"absolute",top:6,left:6,...glass(0.55,6,0.45),borderRadius:6,padding:"1px 6px",fontSize:9,fontWeight:900,color:CORAL}}>
                  {itemSizes.map(s=>s.size[0]).join("·")}
                </div>
              )}
              <div style={{fontSize:26,marginBottom:5,lineHeight:1,marginTop:hasSize?10:0}}>{item.emoji}</div>
              <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:2}}>{item.name}</div>
              <div style={{fontSize:11,color:TEXTM,lineHeight:1.4,marginBottom:8}}>{item.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:900,fontSize:14,color:CORAL}}>
                    {hasSize&&minPrice!==maxPrice?`from ${fmt(minPrice)}`:fmt(minPrice)}
                  </div>
                  {hasSize&&(
                    <div style={{fontSize:10,color:TEXTL,fontWeight:600}}>
                      {itemSizes.map(s=>`${s.size[0]} ${fmt(s.price)}`).join(" · ")}
                    </div>
                  )}
                </div>
                <div style={{width:24,height:24,borderRadius:"50%",background:isHov?`linear-gradient(135deg,${CORAL},${ORANGE})`:"rgba(255,255,255,0.55)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:isHov?"#fff":TEXTM,fontWeight:900,transition:"all 190ms"}}>+</div>
              </div>
            </div>
          );
        })}
      </div>
      {customizing&&<ItemCustomizer item={customizing} addons={addons} onConfirm={confirmAdd} onClose={()=>setCustomizing(null)}/>}
    </div>
  );
}

// ─── Section: Orders ──────────────────────────────────────────
function OrdersSection({sales}){
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");

  const filtered=[...sales].reverse().filter(s=>
    !search||
    `#${s.orderNum}`.includes(search)||
    s.items.some(i=>i.name.toLowerCase().includes(search.toLowerCase()))||
    (s.voucher&&s.voucher.toLowerCase().includes(search.toLowerCase()))
  );

  const sel=selected?sales.find(s=>s.id===selected):null;

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      {/* Order list */}
      <div style={{width:300,flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.3)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 14px 10px",flexShrink:0}}>
          <div style={{fontFamily:"'Pacifico',cursive",fontSize:18,color:TEXT,marginBottom:10}}>Orders</div>
          <GlassInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders…"/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"0 14px 14px"}}>
          {filtered.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:TEXTM,fontWeight:600}}>No orders found</div>}
          {filtered.map(s=>(
            <div key={s.id} onClick={()=>setSelected(s.id)} style={{
              ...glass(selected===s.id?0.55:0.32,12,selected===s.id?0.5:0.38),
              borderRadius:14,padding:"11px 13px",cursor:"pointer",marginBottom:8,
              border:selected===s.id?`1.5px solid rgba(255,107,107,0.4)`:"1px solid rgba(255,255,255,0.38)",
              transition:"all 150ms"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:900,fontSize:14,color:CORAL}}>Order #{s.orderNum}</span>
                <span style={{fontWeight:900,fontSize:14,color:TEXT}}>{fmt(s.total)}</span>
              </div>
              <div style={{fontSize:11,color:TEXTM,fontWeight:600,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {s.items.map(i=>`${i.name}${i.size?` (${i.size[0]})`:""}`).join(", ")}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:10,color:TEXTL,fontWeight:600}}>{fmtDateTime(s.ts)}</span>
                {s.voucher&&<span style={{...glass(0.45,6,0.4),borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,color:MINT}}>🎟️ {s.voucher}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order detail */}
      <div style={{flex:1,overflowY:"auto",padding:18}}>
        {!sel?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:TEXTM}}>
            <div style={{fontSize:48,marginBottom:12}}>🧾</div>
            <div style={{fontWeight:800,fontSize:16}}>Select an order to view details</div>
          </div>
        ):(
          <div style={{animation:"slideIn 220ms ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{fontFamily:"'Pacifico',cursive",fontSize:22,color:TEXT}}>Order #{sel.orderNum}</div>
              <div style={{...glass(0.45,8,0.4),borderRadius:8,padding:"3px 12px",fontSize:12,fontWeight:800,color:MINT}}>Completed</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[{icon:"📅",label:"Date",val:fmtDate(sel.ts)},{icon:"⏰",label:"Time",val:fmtTime(sel.ts)},{icon:"🧾",label:"Items",val:sel.items.reduce((a,i)=>a+i.qty,0)+" items"},{icon:"🎟️",label:"Voucher",val:sel.voucher||"None"}].map(x=>(
                <div key={x.label} style={{...glass(0.38,14,0.42),borderRadius:14,padding:"12px 14px"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{x.icon}</div>
                  <div style={{fontSize:11,color:TEXTM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em"}}>{x.label}</div>
                  <div style={{fontSize:14,fontWeight:800,color:TEXT,marginTop:2}}>{x.val}</div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div style={{...glass(0.32,14,0.38),borderRadius:16,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:14,color:TEXT,marginBottom:10}}>Items Ordered</div>
              {sel.items.map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:i<sel.items.length-1?"1px solid rgba(255,255,255,0.25)":"none"}}>
                  <div style={{...glass(0.45,8,0.38),borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:13,color:TEXT}}>{item.name} {item.size?<span style={{...glass(0.45,6,0.4),borderRadius:5,padding:"1px 7px",fontSize:11,fontWeight:800,color:ORANGE}}>({item.size[0]})</span>:""}</div>
                    {item.addons&&item.addons.length>0&&(
                      <div style={{fontSize:11,color:TEXTM,marginTop:3}}>+ {item.addons.map(a=>a.name).join(", ")}</div>
                    )}
                  </div>
                  <div style={{fontWeight:800,fontSize:13,color:CORAL}}>×{item.qty}</div>
                  <div style={{fontWeight:900,fontSize:14,color:TEXT,minWidth:52,textAlign:"right"}}>{fmt(item.price*item.qty)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{...glass(0.32,14,0.38),borderRadius:16,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:TEXTM,marginBottom:5}}><span>Subtotal</span><span>{fmt(sel.subtotal)}</span></div>
              {sel.discount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:MINT,marginBottom:5}}><span>🎟️ Discount ({sel.voucher})</span><span>-{fmt(sel.discount)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:900,color:TEXT,borderTop:"1px solid rgba(255,255,255,0.3)",paddingTop:8,marginTop:4}}><span>Total</span><span style={{color:CORAL}}>{fmt(sel.total)}</span></div>
            </div>

            {sel.note&&<div style={{...glass(0.32,14,0.38),borderRadius:14,padding:"12px 14px",fontSize:13,color:TEXTM,fontWeight:600}}><span style={{fontWeight:800,color:TEXT}}>Note: </span>{sel.note}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Recent Log ──────────────────────────────────────
function RecentLogSection({sales}){
  const [filter,setFilter]=useState("all");
  const sorted=[...sales].sort((a,b)=>b.ts-a.ts);
  const today=new Date();today.setHours(0,0,0,0);
  const week=new Date(today);week.setDate(today.getDate()-7);

  const filtered=sorted.filter(s=>{
    if(filter==="today")return s.ts>=today.getTime();
    if(filter==="week") return s.ts>=week.getTime();
    return true;
  });

  const totalRev=filtered.reduce((a,s)=>a+s.total,0);
  const totalDisc=filtered.reduce((a,s)=>a+(s.discount||0),0);

  // Group by date
  const groups={};
  filtered.forEach(s=>{
    const d=fmtDate(s.ts);
    if(!groups[d])groups[d]=[];
    groups[d].push(s);
  });

  return(
    <div style={{flex:1,overflowY:"auto",padding:18}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Pacifico',cursive",fontSize:21,color:TEXT}}>Recent Log</div>
        <div style={{display:"flex",gap:6}}>
          {[["all","All Time"],["week","This Week"],["today","Today"]].map(([v,l])=>(
            <CatPill key={v} label={l} active={filter===v} onClick={()=>setFilter(v)}/>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
        {[{icon:"🧾",label:"Transactions",val:filtered.length,color:CORAL},{icon:"💰",label:"Revenue",val:fmt(totalRev),color:ORANGE},{icon:"🏷️",label:"Discounts Given",val:fmt(totalDisc),color:MINT}].map(s=>(
          <div key={s.label} style={{...glass(0.38,14,0.42),borderRadius:14,padding:"12px 14px"}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontWeight:900,fontSize:18,color:s.color,letterSpacing:"-0.4px"}}>{s.val}</div>
            <div style={{fontSize:10,color:TEXTM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:TEXTM,fontWeight:700,fontSize:15}}>No records for this period</div>}

      {/* Grouped by date */}
      {Object.entries(groups).map(([date,rows])=>(
        <div key={date} style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{fontWeight:900,fontSize:13,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.05em"}}>{date}</div>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.35)"}}/>
            <div style={{fontSize:12,fontWeight:800,color:CORAL}}>{fmt(rows.reduce((a,s)=>a+s.total,0))}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {rows.map(s=>(
              <div key={s.id} style={{...glass(0.32,12,0.38),borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
                {/* Time + order # */}
                <div style={{flexShrink:0,width:72,textAlign:"center"}}>
                  <div style={{fontWeight:900,fontSize:13,color:TEXT}}>#{s.orderNum}</div>
                  <div style={{fontSize:11,color:TEXTL,fontWeight:600}}>{fmtTime(s.ts)}</div>
                </div>
                <div style={{width:1,height:32,background:"rgba(255,255,255,0.35)",flexShrink:0}}/>
                {/* Item thumbnails */}
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  {s.items.slice(0,3).map((it,i)=>(
                    <div key={i} style={{...glass(0.45,6,0.38),borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{it.emoji}</div>
                  ))}
                  {s.items.length>3&&<div style={{...glass(0.38,6,0.35),borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:TEXTM}}>+{s.items.length-3}</div>}
                </div>
                {/* Description */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {s.items.map(i=>`${i.name}${i.size?` (${i.size[0]})`:""} ×${i.qty}`).join(", ")}
                  </div>
                  {s.note&&<div style={{fontSize:11,color:TEXTL,fontWeight:600}}>Note: {s.note}</div>}
                </div>
                {/* Badges */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                  {s.voucher&&<span style={{...glass(0.5,6,0.45),borderRadius:6,padding:"1px 8px",fontSize:10,fontWeight:800,color:MINT}}>🎟️ {s.voucher}</span>}
                  {s.discount>0&&<span style={{fontSize:10,fontWeight:700,color:ORANGE}}>-{fmt(s.discount)}</span>}
                </div>
                {/* Total */}
                <div style={{flexShrink:0,textAlign:"right"}}>
                  <div style={{fontWeight:900,fontSize:15,color:CORAL}}>{fmt(s.total)}</div>
                  {s.discount>0&&<div style={{fontSize:10,color:TEXTL,textDecoration:"line-through"}}>{fmt(s.subtotal)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Analytics ───────────────────────────────────────
function AnalyticsSection({sales,setSales,menu}){
  const totalRev=sales.reduce((a,s)=>a+s.total,0);
  const totalDiscount=sales.reduce((a,s)=>a+(s.discount||0),0);
  const totalOrders=sales.length;
  const avgOrder=totalOrders?totalRev/totalOrders:0;
  const voucherUse=sales.filter(s=>s.voucher).length;

  const itemMap={};
  sales.forEach(s=>s.items.forEach(i=>{
    if(!itemMap[i.id])itemMap[i.id]={name:i.name,qty:0,rev:0,emoji:i.emoji||menu.find(m=>m.id===i.id)?.emoji||"📦"};
    itemMap[i.id].qty+=i.qty;itemMap[i.id].rev+=i.price*i.qty;
  }));
  const best=Object.values(itemMap).sort((a,b)=>b.qty-a.qty).slice(0,8);
  const maxQ=best[0]?.qty||1;

  const catMap={};
  sales.forEach(s=>s.items.forEach(i=>{
    const cat=menu.find(m=>m.id===i.id)?.category||i.category||"Other";
    catMap[cat]=(catMap[cat]||0)+i.price*i.qty;
  }));
  const catArr=Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const maxC=catArr[0]?.[1]||1;

  // Size popularity
  const sizeMap={Small:0,Medium:0,Large:0};
  sales.forEach(s=>s.items.forEach(i=>{if(i.size&&sizeMap[i.size]!==undefined)sizeMap[i.size]+=i.qty;}));
  const sizeTotal=Object.values(sizeMap).reduce((a,b)=>a+b,1);

  // Add-on popularity
  const addonMap={};
  sales.forEach(s=>s.items.forEach(i=>(i.addons||[]).forEach(a=>{addonMap[a.name]=(addonMap[a.name]||0)+1;})));
  const addonArr=Object.entries(addonMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const hourly=Array(12).fill(0);
  const nowT=Date.now();
  sales.forEach(s=>{const h=Math.floor((nowT-s.ts)/3600000);if(h>=0&&h<12)hourly[11-h]++;});
  const maxH=Math.max(...hourly,1);
  const hLabels=Array.from({length:12},(_,i)=>new Date(nowT-(11-i)*3600000).getHours().toString().padStart(2,"0"));

  const stats=[
    {icon:"💰",label:"Revenue",val:fmt(totalRev),color:CORAL},
    {icon:"🧾",label:"Orders",val:totalOrders,color:ORANGE},
    {icon:"📈",label:"Avg Order",val:fmt(avgOrder),color:MINT},
    {icon:"🎟️",label:"Vouchers Used",val:voucherUse,color:SKY},
    {icon:"🏷️",label:"Total Discount",val:fmt(totalDiscount),color:YELLOW},
    {icon:"📋",label:"Menu Items",val:menu.length,color:"#9B59B6"},
  ];

  const [confirmReset,setConfirmReset]=useState(null); // null | "today" | "all"

  const todayStart=(()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime();})();

  const doReset=()=>{
    if(confirmReset==="today"){
      setSales(p=>p.filter(s=>s.ts<todayStart));
    } else if(confirmReset==="all"){
      setSales([]);
    }
    setConfirmReset(null);
  };

  const todayCount=sales.filter(s=>s.ts>=todayStart).length;

  return(
    <div style={{flex:1,overflowY:"auto",padding:18}}>
      {/* Header row with reset buttons */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Pacifico',cursive",fontSize:21,color:TEXT}}>Analytics</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setConfirmReset("today")} style={{
            display:"flex",alignItems:"center",gap:6,
            padding:"7px 13px",borderRadius:10,cursor:"pointer",border:"none",
            ...glass(0.42,10,0.44),fontWeight:700,fontSize:12,color:TEXTM,
            transition:"all 150ms",
          }}>
            <span>🗓️</span> Reset Today
            {todayCount>0&&<span style={{background:"rgba(255,107,107,0.20)",borderRadius:8,
              padding:"1px 6px",fontSize:10,fontWeight:800,color:CORAL}}>{todayCount}</span>}
          </button>
          <button onClick={()=>setConfirmReset("all")} style={{
            display:"flex",alignItems:"center",gap:6,
            padding:"7px 13px",borderRadius:10,cursor:"pointer",border:"none",
            background:"rgba(220,50,50,0.14)",
            border:"1px solid rgba(220,50,50,0.25)",
            fontWeight:700,fontSize:12,color:"#c02020",
            transition:"all 150ms",
          }}>
            <span>🗑️</span> Reset All Data
          </button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {stats.map((s,i)=>(
          <div key={s.label} style={{...glass(0.38,16,0.42),borderRadius:16,padding:"13px",animation:`fadeUp 300ms ease ${i*50}ms both`}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:19,fontWeight:900,color:s.color,letterSpacing:"-0.5px"}}>{s.val}</div>
            <div style={{fontSize:10,color:TEXTM,fontWeight:700,marginTop:2,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{...glass(0.32,16,0.38),borderRadius:16,padding:14}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:10}}>🏆 Best Sellers</div>
          {best.length===0&&<div style={{color:TEXTM,fontSize:12}}>No data yet</div>}
          {best.map((it,i)=>(
            <div key={it.name} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:TEXT}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} {it.name}</span>
                <span style={{fontSize:10,fontWeight:800,color:CORAL}}>{it.qty}×</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.32)",borderRadius:4}}>
                <div style={{height:"100%",width:`${(it.qty/maxQ)*100}%`,background:`linear-gradient(90deg,${CORAL},${ORANGE})`,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{...glass(0.32,16,0.38),borderRadius:16,padding:14}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:10}}>📂 Category Revenue</div>
          {catArr.map(([cat,rev])=>(
            <div key={cat} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:11,fontWeight:700,color:TEXT}}>{CAT_EMOJI[cat]||"📦"} {cat}</span>
                <span style={{fontSize:10,fontWeight:800,color:MINT}}>{fmt(rev)}</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.32)",borderRadius:4}}>
                <div style={{height:"100%",width:`${(rev/maxC)*100}%`,background:`linear-gradient(90deg,${MINT},${SKY})`,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{...glass(0.32,16,0.38),borderRadius:16,padding:14}}>
            <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:10}}>📐 Size Split</div>
            {Object.entries(sizeMap).map(([sz,cnt])=>(
              <div key={sz} style={{marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:11,fontWeight:700,color:TEXT}}>{sz[0]}</span>
                  <span style={{fontSize:10,fontWeight:800,color:ORANGE}}>{Math.round(cnt/sizeTotal*100)}%</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.32)",borderRadius:4}}>
                  <div style={{height:"100%",width:`${(cnt/sizeTotal)*100}%`,background:`linear-gradient(90deg,${ORANGE},${YELLOW})`,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{...glass(0.32,16,0.38),borderRadius:16,padding:14}}>
            <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:10}}>🫧 Top Add-ons</div>
            {addonArr.length===0&&<div style={{color:TEXTM,fontSize:11}}>No add-on data</div>}
            {addonArr.map(([name,cnt])=>(
              <div key={name} style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,color:TEXTM,padding:"3px 0"}}><span>{name}</span><span style={{color:MINT}}>{cnt}×</span></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{...glass(0.32,16,0.38),borderRadius:16,padding:14,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:10}}>⏱ Orders — Last 12h</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:5,height:64}}>
          {hourly.map((v,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:"100%",height:`${Math.max(4,(v/maxH)*52)}px`,background:v>0?`linear-gradient(0deg,${CORAL},${YELLOW})`:"rgba(255,255,255,0.22)",borderRadius:"3px 3px 0 0",transition:"height 600ms ease"}}/>
              <span style={{fontSize:9,color:TEXTL,fontWeight:700}}>{hLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reset Confirmation Modal ── */}
      {confirmReset&&(
        <div onClick={()=>setConfirmReset(null)} style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",
          backdropFilter:"blur(5px)",zIndex:200,
          display:"flex",alignItems:"center",justifyContent:"center",padding:16,
          animation:"fadeUp 180ms ease",
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            ...glass(0.90,28,0.60),borderRadius:22,
            width:"100%",maxWidth:340,
            boxShadow:"0 20px 60px rgba(0,0,0,0.18)",
            animation:"slideIn 180ms ease",overflow:"hidden",
          }}>
            {/* Accent bar */}
            <div style={{height:4,background:confirmReset==="all"
              ?"linear-gradient(90deg,#c02020,#ff4444)"
              :`linear-gradient(90deg,${ORANGE},${YELLOW})`}}/>
            <div style={{padding:"22px 24px 20px"}}>
              <div style={{fontSize:36,marginBottom:10,textAlign:"center"}}>
                {confirmReset==="all"?"🗑️":"🗓️"}
              </div>
              <div style={{fontWeight:900,fontSize:17,color:TEXT,marginBottom:6,textAlign:"center"}}>
                {confirmReset==="all"?"Wipe all sales data?":"Reset today's data?"}
              </div>
              <div style={{fontSize:13,color:TEXTM,marginBottom:20,textAlign:"center",lineHeight:1.5}}>
                {confirmReset==="all"
                  ?"This deletes every sales record and cannot be undone. Use this to start fresh."
                  :`This removes all ${todayCount} order${todayCount!==1?"s":""} from today. Past records stay intact.`}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirmReset(null)} style={{
                  flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",
                  ...glass(0.45,10,0.45),fontWeight:700,fontSize:14,color:TEXT,
                }}>Cancel</button>
                <button onClick={doReset} style={{
                  flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",
                  background:confirmReset==="all"
                    ?"linear-gradient(135deg,#c02020,#ff4444)"
                    :`linear-gradient(135deg,${ORANGE},${YELLOW})`,
                  color:"#fff",fontWeight:800,fontSize:14,
                  fontFamily:"'Nunito',sans-serif",
                  boxShadow:confirmReset==="all"
                    ?"0 4px 14px rgba(192,32,32,0.35)"
                    :"0 4px 14px rgba(255,140,66,0.35)",
                }}>
                  {confirmReset==="all"?"Yes, wipe all":"Yes, reset today"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Admin ───────────────────────────────────────────
function AdminSection({menu,setMenu,addons,setAddons,vouchers,setVouchers,toast}){
  const [subTab,setSubTab]=useState("products");
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"12px 18px 0",flexShrink:0,display:"flex",gap:6}}>
        <CatPill label="🛍️ Products" active={subTab==="products"} onClick={()=>setSubTab("products")}/>
        <CatPill label="🫧 Add-ons" active={subTab==="addons"} onClick={()=>setSubTab("addons")}/>
        <CatPill label="🎟️ Vouchers" active={subTab==="vouchers"} onClick={()=>setSubTab("vouchers")}/>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 18px 18px"}}>
        {subTab==="products"&&<ProductsPanel menu={menu} setMenu={setMenu} toast={toast}/>}
        {subTab==="addons"&&<AddonsPanel addons={addons} setAddons={setAddons} toast={toast}/>}
        {subTab==="vouchers"&&<VouchersPanel vouchers={vouchers} setVouchers={setVouchers} toast={toast}/>}
      </div>
    </div>
  );
}

// ─── Default variant prices for a given base price ────────────
const defaultVariants=(basePrice)=>[
  {size:"Small",  price:basePrice,  enabled:true},
  {size:"Medium", price:Math.round(basePrice*1.25), enabled:true},
  {size:"Large",  price:Math.round(basePrice*1.5),  enabled:true},
];

function ProductsPanel({menu,setMenu,toast}){
  const blankForm={name:"",category:"",basePrice:"",desc:"",emoji:"☕",useVariants:false,variants:[{size:"Small",price:"",enabled:true},{size:"Medium",price:"",enabled:true},{size:"Large",price:"",enabled:true}]};
  const [catInput,setCatInput]=useState("");
  const [showSuggestions,setShowSuggestions]=useState(false);
  const [form,setForm]=useState(blankForm);
  const [editId,setEditId]=useState(null);
  const [filter,setFilter]=useState("All");
  const [confirmDel,setConfirmDel]=useState(null);
  const f=(k)=>(v)=>setForm(p=>({...p,[k]:v}));

  // When category changes, auto-enable variants for SIZE_CATS
  const handleCatChange=(cat)=>{
    const willUseVariants=SIZE_CATS.includes(cat);
    setForm(p=>({...p,category:cat,useVariants:willUseVariants}));
    setCatInput(cat);
    setShowSuggestions(false);
  };

  // When basePrice changes and variants are on, auto-fill variant prices
  const handleBasePriceChange=(val)=>{
    setForm(p=>{
      const bp=parseFloat(val)||0;
      const variants=p.useVariants&&bp>=29
        ? defaultVariants(bp).map((d,i)=>({...d,price:String(d.price),enabled:p.variants[i]?.enabled!==undefined?p.variants[i].enabled:true}))
        : p.variants;
      return {...p,basePrice:val,variants};
    });
  };

  const setVariantField=(idx,key,val)=>{
    setForm(p=>{
      const v=[...p.variants];
      v[idx]={...v[idx],[key]:val};
      return {...p,variants:v};
    });
  };

  const save=()=>{
    if(!form.name.trim()){toast("⚠️ Name required");return;}
    if(!form.category.trim()){toast("⚠️ Category required — type or select one");return;}
    if(form.useVariants){
      const enabled=form.variants.filter(v=>v.enabled);
      if(enabled.length===0){toast("⚠️ Enable at least one size variant");return;}
      for(const v of enabled){
        const p=parseFloat(v.price);
        if(isNaN(p)||p<29){toast(`⚠️ ${v.size} price must be ≥ ₱29`);return;}
      }
      // basePrice = smallest enabled variant price
      const bp=Math.min(...enabled.map(v=>parseFloat(v.price)));
      const parsedVariants=form.variants.map(v=>({...v,price:parseFloat(v.price)||0}));
      if(editId){setMenu(p=>p.map(m=>m.id===editId?{...m,...form,basePrice:bp,variants:parsedVariants}:m));toast("✅ Updated");}
      else{setMenu(p=>[...p,{...form,basePrice:bp,variants:parsedVariants,id:Date.now()}]);toast("✅ Product added");}
    } else {
      const basePrice=parseFloat(form.basePrice);
      if(isNaN(basePrice)||basePrice<29){toast("⚠️ Min price is ₱29");return;}
      if(editId){setMenu(p=>p.map(m=>m.id===editId?{...m,...form,basePrice,variants:null}:m));toast("✅ Updated");}
      else{setMenu(p=>[...p,{...form,basePrice,variants:null,id:Date.now()}]);toast("✅ Product added");}
    }
    setForm(blankForm);setEditId(null);setCatInput("");setShowSuggestions(false);
  };

  const startEdit=(it)=>{
    const hasV=it.variants&&it.variants.length>0;
    setForm({
      ...it,
      basePrice:String(it.basePrice),
      useVariants:hasV||SIZE_CATS.includes(it.category),
      variants:hasV
        ? it.variants.map(v=>({...v,price:String(v.price)}))
        : defaultVariants(it.basePrice).map(v=>({...v,price:String(v.price)})),
    });
    setEditId(it.id);
    setCatInput(it.category||"");
    setShowSuggestions(false);
  };

  const del=(id)=>{setMenu(p=>p.filter(m=>m.id!==id));setConfirmDel(null);toast("🗑️ Removed");};
  const visible=menu.filter(m=>filter==="All"||m.category===filter);
  // Reset filter if it no longer exists in menu
  // (handled gracefully — just shows empty list with message)

  const VARIANT_COLORS=["rgba(255,107,107,0.20)","rgba(255,140,66,0.20)","rgba(255,209,102,0.20)"];
  const VARIANT_TEXT=[CORAL,ORANGE,YELLOW.replace("FF","CC")];

  return(
    <>
      <div style={{fontFamily:"'Pacifico',cursive",fontSize:17,color:TEXT,marginBottom:12}}>Products</div>
      <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:14,alignItems:"start"}}>

        {/* ── Form ── */}
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:15,position:"sticky",top:0}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:11}}>{editId?"✏️ Edit Product":"➕ New Product"}</div>

          {/* Name + Desc */}
          {[{l:"Name",k:"name",ph:"e.g. Oat Latte"},{l:"Description",k:"desc",ph:"Short tagline"}].map(({l,k,ph})=>(
            <div key={k} style={{marginBottom:9}}>
              <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</label>
              <GlassInput value={form[k]} onChange={e=>f(k)(e.target.value)} placeholder={ph}/>
            </div>
          ))}

          {/* Category — dynamic free-text with suggestion tags */}
          <div style={{marginBottom:9,position:"relative"}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Category</label>
            <div style={{position:"relative"}}>
              <input
                value={catInput}
                onChange={e=>{
                  const val=e.target.value;
                  setCatInput(val);
                  setForm(p=>({...p,category:val,useVariants:SIZE_CATS.includes(val)||p.useVariants}));
                  setShowSuggestions(val.length>0);
                }}
                onFocus={()=>setShowSuggestions(true)}
                onBlur={()=>setTimeout(()=>setShowSuggestions(false),150)}
                placeholder="Type or pick a category…"
                style={{...glass(0.45,12,0.5),borderRadius:9,padding:"9px 36px 9px 13px",fontSize:13,
                  color:TEXT,fontWeight:700,width:"100%",outline:"none",
                  border:form.category?"1.5px solid rgba(255,107,107,0.35)":"1px solid rgba(255,255,255,0.45)"}}
              />
              {form.category&&(
                <button onClick={()=>{setCatInput("");setForm(p=>({...p,category:""}));}} style={{
                  position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                  ...glass(0.4,6,0.4),border:"none",borderRadius:"50%",width:20,height:20,
                  cursor:"pointer",fontSize:11,color:TEXTM,fontWeight:800,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              )}
            </div>

            {/* Filtered suggestion dropdown */}
            {showSuggestions&&(()=>{
              const q=catInput.toLowerCase();
              const filtered=SUGGESTED_CATS.filter(s=>!q||s.label.toLowerCase().includes(q));
              if(filtered.length===0) return null;
              return(
                <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,
                  ...glass(0.92,18,0.55),borderRadius:10,marginTop:4,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.12)",overflow:"hidden",
                  maxHeight:180,overflowY:"auto"}}>
                  {filtered.map(s=>(
                    <div key={s.label}
                      onMouseDown={()=>handleCatChange(s.label)}
                      style={{display:"flex",alignItems:"center",gap:9,padding:"8px 13px",
                        cursor:"pointer",fontSize:13,fontWeight:700,color:TEXT,
                        background:form.category===s.label?"rgba(255,107,107,0.12)":"transparent",
                        transition:"background 120ms"}}>
                      <span style={{fontSize:16}}>{s.emoji}</span>
                      <span style={{flex:1}}>{s.label}</span>
                      {form.category===s.label&&<span style={{fontSize:11,color:CORAL,fontWeight:900}}>✓</span>}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Suggestion tag pills */}
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>
              {SUGGESTED_CATS.filter(s=>!catInput||s.label.toLowerCase().includes(catInput.toLowerCase())).slice(0,catInput?undefined:8).map(s=>(
                <button key={s.label}
                  onMouseDown={()=>handleCatChange(s.label)}
                  style={{
                    padding:"3px 9px",borderRadius:20,cursor:"pointer",
                    fontSize:11,fontWeight:700,transition:"all 130ms",
                    ...(form.category===s.label
                      ?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",border:"none",boxShadow:"0 2px 8px rgba(255,107,107,0.28)"}
                      :{...glass(0.38,6,0.40),border:"none",color:TEXTM})
                  }}>
                  {s.emoji} {s.label}
                </button>
              ))}
              {!catInput&&SUGGESTED_CATS.length>8&&(
                <button onMouseDown={()=>setShowSuggestions(true)}
                  style={{padding:"3px 9px",borderRadius:20,cursor:"pointer",
                    fontSize:11,fontWeight:700,...glass(0.32,6,0.35),border:"none",color:TEXTM}}>
                  +{SUGGESTED_CATS.length-8} more…
                </button>
              )}
            </div>

            {/* Custom category hint */}
            {catInput&&!SUGGESTED_CATS.some(s=>s.label.toLowerCase()===catInput.toLowerCase())&&(
              <div style={{fontSize:10,color:MINT,fontWeight:700,marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                <span>✨</span> Custom category: <strong>"{catInput}"</strong> — press Enter or click Add
              </div>
            )}
          </div>

          {/* Variants toggle */}
          <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setForm(p=>({...p,useVariants:!p.useVariants}))} style={{width:36,height:20,borderRadius:10,cursor:"pointer",border:"none",transition:"all 200ms",background:form.useVariants?`linear-gradient(135deg,${CORAL},${ORANGE})`:"rgba(200,200,200,0.5)",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:form.useVariants?16:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 200ms"}}/>
            </button>
            <span style={{fontSize:12,fontWeight:700,color:form.useVariants?CORAL:TEXTM}}>Size Variants (S / M / L)</span>
          </div>

          {/* Variant price inputs */}
          {form.useVariants?(
            <div style={{...glass(0.28,8,0.28),borderRadius:12,padding:12,marginBottom:9}}>
              <div style={{fontSize:10,fontWeight:800,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Set price per size</div>
              {form.variants.map((v,i)=>(
                <div key={v.size} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  {/* Enable toggle */}
                  <button onClick={()=>setVariantField(i,"enabled",!v.enabled)} style={{width:20,height:20,borderRadius:"50%",cursor:"pointer",border:"none",flexShrink:0,transition:"all 150ms",background:v.enabled?`linear-gradient(135deg,${CORAL},${ORANGE})`:"rgba(200,200,200,0.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:900}}>
                    {v.enabled?"✓":""}
                  </button>
                  {/* Size badge */}
                  <div style={{width:52,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:v.enabled?VARIANT_COLORS[i]:"rgba(200,200,200,0.15)",border:`1px solid ${v.enabled?"rgba(255,255,255,0.4)":"rgba(200,200,200,0.2)"}`,transition:"all 150ms"}}>
                    <span style={{fontWeight:900,fontSize:12,color:v.enabled?VARIANT_TEXT[i]:TEXTL}}>{v.size[0]}</span>
                    <span style={{fontWeight:600,fontSize:9,color:v.enabled?VARIANT_TEXT[i]:TEXTL,marginLeft:2}}>{v.size.slice(1)}</span>
                  </div>
                  {/* Price input */}
                  <div style={{flex:1,position:"relative"}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontWeight:800,fontSize:13,color:TEXTM,pointerEvents:"none"}}>₱</span>
                    <input
                      type="number" value={v.price}
                      onChange={e=>setVariantField(i,"price",e.target.value)}
                      disabled={!v.enabled}
                      placeholder={v.enabled?"e.g. 79":"—"}
                      style={{...glass(v.enabled?0.45:0.22,10,v.enabled?0.45:0.2),borderRadius:8,padding:"7px 10px 7px 26px",fontSize:13,color:v.enabled?TEXT:TEXTM,fontWeight:700,width:"100%",outline:"none",opacity:v.enabled?1:0.5}}
                    />
                  </div>
                  {/* Auto-fill hint */}
                  {i===0&&v.enabled&&parseFloat(v.price)>=29&&(
                    <button onClick={()=>{
                      const bp=parseFloat(v.price);
                      const filled=defaultVariants(bp).map((d,j)=>({...form.variants[j],price:String(d.price),enabled:form.variants[j].enabled}));
                      setForm(p=>({...p,variants:filled}));
                    }} title="Auto-fill M & L prices" style={{...glass(0.38,6,0.38),border:"none",borderRadius:7,padding:"4px 8px",cursor:"pointer",fontSize:10,fontWeight:800,color:SKY,flexShrink:0,whiteSpace:"nowrap"}}>Auto ✦</button>
                  )}
                </div>
              ))}
              <div style={{fontSize:10,color:TEXTL,fontWeight:600,marginTop:4}}>💡 Click "Auto ✦" next to Small to auto-fill M (×1.25) and L (×1.5)</div>
            </div>
          ):(
            <div style={{marginBottom:9}}>
              <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Price ₱</label>
              <GlassInput type="number" value={form.basePrice} onChange={e=>handleBasePriceChange(e.target.value)} placeholder="min ₱29"/>
            </div>
          )}

          {/* Emoji */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Emoji</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {EMOJIS.map(em=>(
                <button key={em} onClick={()=>f("emoji")(em)} style={{width:30,height:30,borderRadius:7,fontSize:15,cursor:"pointer",transition:"all 130ms",...(form.emoji===em?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,border:"none"}:{...glass(0.35,8,0.38),border:"none"})}}>{em}</button>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:7}}>
            <GlassBtn onClick={save} style={{flex:1,padding:"9px",fontSize:13}}>{editId?"💾 Save":"➕ Add"}</GlassBtn>
            {editId&&<GlassBtn variant="secondary" onClick={()=>{setForm(blankForm);setEditId(null);}} style={{padding:"9px 12px",fontSize:13}}>✕</GlassBtn>}
          </div>
        </div>

        {/* ── Product list ── */}
        <div>
          {/* Dynamic filter pills — derived from actual menu categories */}
          {(()=>{
            const allCats=["All",...[...new Set(menu.map(m=>m.category))].sort()];
            return(
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
                {allCats.map(c=>{
                  const sug=SUGGESTED_CATS.find(s=>s.label===c);
                  const emoji=CAT_EMOJI[c]||(sug?sug.emoji:"📦");
                  return <CatPill key={c} label={`${emoji} ${c}`} active={filter===c} onClick={()=>setFilter(c)}/>;
                })}
              </div>
            );
          })()}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {visible.map(it=>{
              const hasV=it.variants&&it.variants.length>0;
              const enabledV=hasV?it.variants.filter(v=>v.enabled):[];
              return(
                <div key={it.id} style={{...glass(0.32,14,0.38),borderRadius:13,padding:"10px 13px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{...glass(0.45,8,0.38),borderRadius:9,width:34,height:34,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{it.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:800,fontSize:13,color:TEXT}}>{it.name}</div>
                      <div style={{fontSize:11,color:TEXTM,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.category} · {it.desc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {hasV?(
                        <div style={{display:"flex",gap:4}}>
                          {enabledV.map((v,i)=>(
                            <div key={v.size} style={{...glass(0.45,6,0.38),borderRadius:7,padding:"3px 8px",textAlign:"center"}}>
                              <div style={{fontSize:9,fontWeight:800,color:TEXTM}}>{v.size[0]}</div>
                              <div style={{fontSize:11,fontWeight:900,color:CORAL}}>{fmt(v.price)}</div>
                            </div>
                          ))}
                        </div>
                      ):(
                        <div style={{fontWeight:900,fontSize:13,color:CORAL}}>{fmt(it.basePrice)}</div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>startEdit(it)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:800,color:SKY}}>Edit</button>
                      <button onClick={()=>setConfirmDel(it.id)} style={{background:"rgba(220,60,60,0.18)",border:"1px solid rgba(220,60,60,0.28)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:800,color:"#c22"}}>Del</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {visible.length===0&&<div style={{padding:"20px 0",textAlign:"center",color:TEXTM,fontWeight:600}}>No items in this category</div>}
          </div>
        </div>
      </div>

      {confirmDel&&(
        <div onClick={()=>setConfirmDel(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{...glass(0.88,24,0.6),borderRadius:20,padding:"24px 28px",maxWidth:280,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:7}}>🗑️</div>
            <div style={{fontWeight:900,fontSize:15,color:TEXT,marginBottom:5}}>Delete product?</div>
            <div style={{fontSize:12,color:TEXTM,marginBottom:14}}>This cannot be undone.</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <GlassBtn variant="secondary" onClick={()=>setConfirmDel(null)} style={{padding:"8px 14px",fontSize:13}}>Cancel</GlassBtn>
              <GlassBtn variant="danger" onClick={()=>del(confirmDel)} style={{padding:"8px 14px",fontSize:13}}>Delete</GlassBtn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddonsPanel({addons,setAddons,toast}){
  const ADDON_CAT_OPTS=["Topping","Shot","Milk","Syrup"];
  const blank={name:"",category:"Topping",price:"",emoji:"🍦"};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);
  const [filter,setFilter]=useState("All");
  const f=(k)=>(v)=>setForm(p=>({...p,[k]:v}));

  const save=()=>{
    if(!form.name.trim()||!form.price){toast("⚠️ Name & price required");return;}
    const price=parseFloat(form.price);
    if(isNaN(price)||price<29){toast("⚠️ Min price is ₱29");return;}
    if(editId){setAddons(p=>p.map(a=>a.id===editId?{...a,...form,price}:a));toast("✅ Add-on updated");}
    else{setAddons(p=>[...p,{...form,price,id:`a${Date.now()}`}]);toast("✅ Add-on added");}
    setForm(blank);setEditId(null);
  };
  const startEdit=(it)=>{setForm({...it,price:String(it.price)});setEditId(it.id);};
  const del=(id)=>{setAddons(p=>p.filter(a=>a.id!==id));toast("🗑️ Add-on removed");};
  const visible=addons.filter(a=>filter==="All"||a.category===filter);

  return(
    <>
      <div style={{fontFamily:"'Pacifico',cursive",fontSize:17,color:TEXT,marginBottom:12}}>Add-ons & Toppings</div>
      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:14,alignItems:"start"}}>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:15,position:"sticky",top:0}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:11}}>{editId?"✏️ Edit Add-on":"➕ New Add-on"}</div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Name</label>
            <GlassInput value={form.name} onChange={e=>f("name")(e.target.value)} placeholder="e.g. Popping Boba"/>
          </div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Category</label>
            <select value={form.category} onChange={e=>f("category")(e.target.value)} style={{...glass(0.45,12,0.5),borderRadius:9,padding:"9px 13px",fontSize:13,color:TEXT,fontWeight:700,width:"100%",cursor:"pointer",outline:"none"}}>
              {ADDON_CAT_OPTS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Price ₱ (min 29)</label>
            <GlassInput type="number" value={form.price} onChange={e=>f("price")(e.target.value)} placeholder="29"/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.05em"}}>Emoji</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {["🍦","🫧","🧋","🥥","☕","🍮","⚡","🌾","🌰","🍬","🍯","🌿","🍓","🫐","🍑","🥭"].map(em=>(
                <button key={em} onClick={()=>f("emoji")(em)} style={{width:30,height:30,borderRadius:7,fontSize:15,cursor:"pointer",transition:"all 130ms",...(form.emoji===em?{background:`linear-gradient(135deg,${MINT},${SKY})`,border:"none"}:{...glass(0.35,8,0.38),border:"none"})}}>{em}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:7}}>
            <GlassBtn onClick={save} style={{flex:1,padding:"9px",fontSize:13}}>{editId?"💾 Save":"➕ Add"}</GlassBtn>
            {editId&&<GlassBtn variant="secondary" onClick={()=>{setForm(blank);setEditId(null);}} style={{padding:"9px 12px",fontSize:13}}>✕</GlassBtn>}
          </div>
        </div>
        <div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
            {["All",...ADDON_CAT_OPTS].map(c=><CatPill key={c} label={c} active={filter===c} onClick={()=>setFilter(c)}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {visible.map(it=>(
              <div key={it.id} style={{...glass(0.32,12,0.38),borderRadius:14,padding:"12px 13px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{...glass(0.45,8,0.38),borderRadius:9,width:34,height:34,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{it.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:13,color:TEXT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.name}</div>
                    <div style={{fontSize:10,color:TEXTM,fontWeight:600}}>{it.category}</div>
                  </div>
                  <div style={{fontWeight:900,fontSize:14,color:MINT,flexShrink:0}}>+{fmt(it.price)}</div>
                </div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>startEdit(it)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:7,padding:"4px 0",cursor:"pointer",fontSize:11,fontWeight:800,color:SKY,flex:1}}>Edit</button>
                  <button onClick={()=>del(it.id)} style={{background:"rgba(220,60,60,0.18)",border:"1px solid rgba(220,60,60,0.28)",borderRadius:7,padding:"4px 0",cursor:"pointer",fontSize:11,fontWeight:800,color:"#c22",flex:1}}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function VouchersPanel({vouchers,setVouchers,toast}){
  const blank={code:"",type:"percent",value:"",desc:"",minOrder:"",usageLimit:"",active:true};
  const [form,setForm]=useState(blank);
  const [editId,setEditId]=useState(null);
  const f=(k)=>(v)=>setForm(p=>({...p,[k]:v}));
  const genCode=()=>f("code")(uid());

  const save=()=>{
    if(!form.code.trim()){toast("⚠️ Code required");return;}
    const value=parseFloat(form.value);
    if(isNaN(value)||value<=0){toast("⚠️ Valid discount required");return;}
    if(form.type==="percent"&&value>100){toast("⚠️ Max 100%");return;}
    const vData={...form,value,code:form.code.toUpperCase().trim(),minOrder:parseFloat(form.minOrder)||0,usageLimit:parseInt(form.usageLimit)||0,used:editId?vouchers.find(v=>v.id===editId)?.used||0:0};
    if(editId){setVouchers(p=>p.map(v=>v.id===editId?{...v,...vData}:v));toast("✅ Voucher updated");}
    else{
      if(vouchers.some(v=>v.code===vData.code)){toast("⚠️ Code exists");return;}
      setVouchers(p=>[...p,{...vData,id:`v${Date.now()}`}]);toast("✅ Voucher created!");
    }
    setForm(blank);setEditId(null);
  };
  const startEdit=(v)=>{setForm({...v,value:String(v.value),minOrder:String(v.minOrder||""),usageLimit:String(v.usageLimit||"")});setEditId(v.id);};
  const toggle=(id)=>setVouchers(p=>p.map(v=>v.id===id?{...v,active:!v.active}:v));
  const del=(id)=>{setVouchers(p=>p.filter(v=>v.id!==id));toast("🗑️ Removed");};

  return(
    <>
      <div style={{fontFamily:"'Pacifico',cursive",fontSize:17,color:TEXT,marginBottom:12}}>Vouchers & Promo Codes</div>
      <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:14,alignItems:"start"}}>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:15,position:"sticky",top:0}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:11}}>{editId?"✏️ Edit":"🎟️ New Voucher"}</div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Code</label>
            <div style={{display:"flex",gap:6}}>
              <GlassInput value={form.code} onChange={e=>f("code")(e.target.value.toUpperCase())} placeholder="PROMO2025" style={{flex:1,letterSpacing:"0.08em",fontWeight:800}}/>
              <button onClick={genCode} style={{...glass(0.42,8,0.44),border:"none",borderRadius:9,padding:"0 11px",cursor:"pointer",fontSize:14}}>🎲</button>
            </div>
          </div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Description</label>
            <GlassInput value={form.desc} onChange={e=>f("desc")(e.target.value)} placeholder="e.g. Summer 10% off"/>
          </div>
          <div style={{marginBottom:9}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Type</label>
            <div style={{display:"flex",gap:6}}>
              {["percent","fixed"].map(t=>(
                <button key={t} onClick={()=>f("type")(t)} style={{flex:1,padding:"7px",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,...(form.type===t?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",border:"none"}:{...glass(0.38,8,0.42),border:"none",color:TEXTM})}}>
                  {t==="percent"?"% Percentage":"₱ Fixed"}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:9}}>
            <div>
              <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Value {form.type==="percent"?"%":"₱"}</label>
              <GlassInput type="number" value={form.value} onChange={e=>f("value")(e.target.value)} placeholder={form.type==="percent"?"10":"50"}/>
            </div>
            <div>
              <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Min Order ₱</label>
              <GlassInput type="number" value={form.minOrder} onChange={e=>f("minOrder")(e.target.value)} placeholder="0=any"/>
            </div>
          </div>
          <div style={{marginBottom:11}}>
            <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Usage Limit (0=unlimited)</label>
            <GlassInput type="number" value={form.usageLimit} onChange={e=>f("usageLimit")(e.target.value)} placeholder="0"/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>f("active")(!form.active)} style={{width:36,height:20,borderRadius:10,cursor:"pointer",border:"none",transition:"all 200ms",background:form.active?`linear-gradient(135deg,${MINT},${SKY})`:"rgba(200,200,200,0.5)",position:"relative"}}>
              <div style={{position:"absolute",top:2,left:form.active?16:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 200ms"}}/>
            </button>
            <span style={{fontSize:12,fontWeight:700,color:form.active?MINT:TEXTM}}>{form.active?"Active":"Inactive"}</span>
          </div>
          <div style={{display:"flex",gap:7}}>
            <GlassBtn onClick={save} style={{flex:1,padding:"9px",fontSize:13}}>{editId?"💾 Save":"🎟️ Create"}</GlassBtn>
            {editId&&<GlassBtn variant="secondary" onClick={()=>{setForm(blank);setEditId(null);}} style={{padding:"9px 12px",fontSize:13}}>✕</GlassBtn>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {vouchers.length===0&&<div style={{padding:"24px 0",textAlign:"center",color:TEXTM,fontWeight:600}}>No vouchers yet</div>}
          {vouchers.map(v=>(
            <div key={v.id} style={{...glass(0.32,14,0.38),borderRadius:15,overflow:"hidden"}}>
              <div style={{height:3,background:v.active?`linear-gradient(90deg,${CORAL},${ORANGE},${YELLOW})`:"rgba(200,200,200,0.4)"}}/>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
                  <div style={{...glass(0.5,10,0.5),borderRadius:10,padding:"7px 12px",flexShrink:0,background:v.active?`linear-gradient(135deg,rgba(255,107,107,0.18),rgba(255,140,66,0.18))`:"rgba(200,200,200,0.2)"}}>
                    <div style={{fontFamily:"'Pacifico',cursive",fontSize:14,color:v.active?CORAL:TEXTM,letterSpacing:1}}>{v.code}</div>
                    <div style={{fontSize:12,fontWeight:900,color:v.active?ORANGE:TEXTM,marginTop:1}}>{v.type==="percent"?`${v.value}% OFF`:`₱${v.value} OFF`}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:12,color:TEXT,marginBottom:4}}>{v.desc||"No description"}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {v.minOrder>0&&<span style={{...glass(0.4,8,0.38),borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700,color:TEXTM}}>Min ₱{v.minOrder}</span>}
                      <span style={{...glass(0.4,8,0.38),borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:700,color:TEXTM}}>Used: {v.used}{v.usageLimit>0?`/${v.usageLimit}`:""}</span>
                      <span style={{...glass(0.4,8,0.38),borderRadius:5,padding:"1px 7px",fontSize:10,fontWeight:800,color:v.active?MINT:"#aaa"}}>{v.active?"● Active":"○ Off"}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <button onClick={()=>toggle(v.id)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:800,color:v.active?ORANGE:MINT}}>{v.active?"Pause":"On"}</button>
                    <button onClick={()=>startEdit(v)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:800,color:SKY}}>Edit</button>
                    <button onClick={()=>del(v.id)} style={{background:"rgba(220,60,60,0.18)",border:"1px solid rgba(220,60,60,0.28)",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:800,color:"#c22"}}>Del</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsSection({posName,setPosName,settings,setSettings,toast}){
  const [name,setName]=useState(posName);
  const [tagline,setTagline]=useState(settings.tagline||"Your summer café companion");
  const [staffName,setStaffName]=useState(settings.staffName||"Barista 1");
  const [terminal,setTerminal]=useState(settings.terminal||"Main Counter");
  const save=()=>{setPosName(name||"Brew POS");setSettings({tagline,staffName,terminal});toast("✅ Settings saved!");};
  const Row=({label,value,onChange,placeholder})=>(
    <div style={{marginBottom:11}}>
      <label style={{fontSize:10,fontWeight:800,color:TEXTM,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</label>
      <GlassInput value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
  return(
    <div style={{flex:1,overflowY:"auto",padding:18}}>
      <div style={{fontFamily:"'Pacifico',cursive",fontSize:21,color:TEXT,marginBottom:16}}>Settings</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,maxWidth:700}}>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:16}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:12}}>🎨 Branding</div>
          <Row label="POS Name" value={name} onChange={setName} placeholder="Brew POS"/>
          <Row label="Tagline" value={tagline} onChange={setTagline} placeholder="Your summer café companion"/>
        </div>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:16}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:12}}>🖥️ Terminal</div>
          <Row label="Staff Name" value={staffName} onChange={setStaffName} placeholder="Barista 1"/>
          <Row label="Terminal Name" value={terminal} onChange={setTerminal} placeholder="Main Counter"/>
        </div>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:16}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:12}}>💵 Currency</div>
          <div style={{...glass(0.5,12,0.48),borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26}}>🇵🇭</span>
            <div><div style={{fontWeight:900,fontSize:18,color:CORAL}}>Philippine Peso (₱)</div><div style={{fontSize:11,color:TEXTM}}>ISO: PHP · Symbol: ₱ · No tax applied</div></div>
          </div>
        </div>
        <div style={{...glass(0.38,18,0.44),borderRadius:18,padding:16}}>
          <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:12}}>👁️ Preview</div>
          <div style={{...glass(0.55,14,0.50),borderRadius:14,padding:14,textAlign:"center"}}>
            <div style={{fontFamily:"'Pacifico',cursive",fontSize:24,color:CORAL,marginBottom:2}}>{name||"Brew POS"}</div>
            <div style={{fontSize:12,color:TEXTM,fontWeight:600,marginBottom:9}}>{tagline}</div>
            <div style={{...glass(0.45,8,0.40),borderRadius:9,padding:"6px 12px",display:"inline-flex",alignItems:"center",gap:7,fontSize:11,color:TEXTM,fontWeight:700}}>👤 {staffName} · 🖥️ {terminal}</div>
          </div>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <GlassBtn onClick={save} style={{width:"100%",padding:13,fontSize:15}}>💾 Save All Settings</GlassBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────
function VoucherDrawer({open,onClose,vouchers,subtotal,onApply,applied}){
  const [input,setInput]=useState("");
  const [err,setErr]=useState("");
  const [shake,setShake]=useState(false);

  const doShake=()=>{setShake(true);setTimeout(()=>setShake(false),500);};

  const tryApply=(v)=>{
    if(!v.active){setErr("Voucher is inactive");doShake();return;}
    if(v.usageLimit>0&&v.used>=v.usageLimit){setErr("Usage limit reached");doShake();return;}
    if(v.minOrder>0&&subtotal<v.minOrder){setErr(`Minimum order is ${fmt(v.minOrder)}`);doShake();return;}
    onApply(v);
    setInput("");setErr("");
    onClose();
  };

  const tryManual=()=>{
    const code=input.toUpperCase().trim();
    if(!code){setErr("Please enter a code");doShake();return;}
    const v=vouchers.find(x=>x.code===code);
    if(!v){setErr("Code not found");doShake();return;}
    tryApply(v);
  };

  const activeVouchers=vouchers.filter(v=>v.active);

  return(
    <>
      {/* Second-layer overlay — sits between main drawer and voucher drawer */}
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:95,
        background:"rgba(0,0,0,0.22)",backdropFilter:"blur(2px)",
        opacity:open?1:0,pointerEvents:open?"all":"none",transition:"opacity 220ms ease"
      }}/>

      {/* Voucher drawer — slides in from the right, stacked on top of cart drawer */}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,
        width:400,maxWidth:"90vw",
        ...glass(0.92,30,0.60),
        zIndex:100,
        display:"flex",flexDirection:"column",
        transform:open?"translateX(0)":"translateX(100%)",
        transition:"transform 280ms cubic-bezier(0.4,0,0.2,1)",
        boxShadow:"-12px 0 48px rgba(0,0,0,0.12)",
      }}>

        {/* Header */}
        <div style={{padding:"18px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.30)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <button onClick={onClose} style={{...glass(0.42,8,0.44),border:"none",borderRadius:8,
              width:30,height:30,cursor:"pointer",fontSize:15,color:TEXTM,fontWeight:800,flexShrink:0}}>←</button>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Pacifico',cursive",fontSize:18,color:TEXT}}>🎟️ Promo Codes</div>
              <div style={{fontSize:11,color:TEXTM,fontWeight:600,marginTop:1}}>{activeVouchers.length} voucher{activeVouchers.length!==1?"s":""} available</div>
            </div>
          </div>

          {/* Manual code input */}
          <div style={{fontSize:10,fontWeight:800,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Enter Code</div>
          <div style={{display:"flex",gap:8,animation:shake?"shake 400ms ease":undefined}}>
            <input
              value={input}
              onChange={e=>{setInput(e.target.value.toUpperCase());setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&tryManual()}
              placeholder="Type promo code here…"
              style={{
                ...glass(0.50,12,0.50),borderRadius:9,padding:"10px 13px",
                fontSize:13,color:TEXT,fontWeight:800,flex:1,outline:"none",
                textTransform:"uppercase",letterSpacing:"0.08em",
                border:err?"1px solid rgba(255,107,107,0.55)":"1px solid rgba(255,255,255,0.5)",
              }}
            />
            <button onClick={tryManual} style={{
              background:`linear-gradient(135deg,${MINT},${SKY})`,color:"#fff",
              border:"none",borderRadius:9,padding:"10px 16px",cursor:"pointer",
              fontWeight:800,fontSize:13,flexShrink:0,
              boxShadow:"0 4px 14px rgba(6,214,160,0.30)",
            }}>Apply</button>
          </div>
          {err&&<div style={{fontSize:11,color:CORAL,fontWeight:700,marginTop:5,animation:"fadeUp 200ms ease"}}>{err}</div>}
        </div>

        {/* Voucher list */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
          <div style={{fontSize:10,fontWeight:800,color:TEXTM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Select Voucher</div>

          {activeVouchers.length===0&&(
            <div style={{textAlign:"center",padding:"40px 0",color:TEXTM}}>
              <div style={{fontSize:40,marginBottom:10}}>🏷️</div>
              <div style={{fontWeight:800,fontSize:14}}>No active vouchers</div>
              <div style={{fontSize:12,marginTop:4,color:TEXTL}}>Create vouchers in Admin → Vouchers</div>
            </div>
          )}

          {activeVouchers.map(v=>{
            const isApplied=applied?.code===v.code;
            const limitHit=v.usageLimit>0&&v.used>=v.usageLimit;
            const minNotMet=v.minOrder>0&&subtotal<v.minOrder;
            const eligible=!limitHit&&!minNotMet;
            const shortfall=v.minOrder>0?v.minOrder-subtotal:0;

            return(
              <div key={v.id} style={{
                ...glass(isApplied?0.65:eligible?0.38:0.25, 12, isApplied?0.6:eligible?0.42:0.25),
                borderRadius:16,marginBottom:10,overflow:"hidden",
                border:isApplied?`1.5px solid rgba(6,214,160,0.55)`:eligible?"1px solid rgba(255,255,255,0.35)":"1px solid rgba(200,200,200,0.2)",
                opacity:eligible||isApplied?1:0.55,
                transition:"all 180ms ease",
              }}>
                {/* Gradient accent bar */}
                <div style={{height:3,background:isApplied?`linear-gradient(90deg,${MINT},${SKY})`:eligible?`linear-gradient(90deg,${CORAL},${ORANGE},${YELLOW})`:"rgba(200,200,200,0.3)"}}/>

                <div style={{padding:"13px 15px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12}}>

                    {/* Code badge */}
                    <div style={{
                      borderRadius:12,padding:"8px 13px",flexShrink:0,textAlign:"center",
                      background:isApplied?"rgba(6,214,160,0.18)":eligible?"rgba(255,107,107,0.13)":"rgba(200,200,200,0.15)",
                      border:`1px solid ${isApplied?"rgba(6,214,160,0.35)":eligible?"rgba(255,107,107,0.25)":"rgba(200,200,200,0.2)"}`,
                    }}>
                      <div style={{fontFamily:"'Pacifico',cursive",fontSize:12,letterSpacing:0.5,
                        color:isApplied?MINT:eligible?CORAL:TEXTM}}>{v.code}</div>
                      <div style={{fontWeight:900,fontSize:14,marginTop:2,
                        color:isApplied?SKY:eligible?ORANGE:TEXTM}}>
                        {v.type==="percent"?`${v.value}% OFF`:`₱${v.value} OFF`}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:800,fontSize:13,color:TEXT,marginBottom:4,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {v.desc||"Promo discount"}
                      </div>

                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {v.minOrder>0&&(
                          <span style={{...glass(0.4,6,0.35),borderRadius:6,padding:"2px 8px",
                            fontSize:10,fontWeight:700,color:minNotMet?CORAL:TEXTM}}>
                            {minNotMet?`Need ${fmt(shortfall)} more`:`Min ₱${v.minOrder} ✓`}
                          </span>
                        )}
                        {v.usageLimit>0&&(
                          <span style={{...glass(0.4,6,0.35),borderRadius:6,padding:"2px 8px",
                            fontSize:10,fontWeight:700,color:limitHit?"#cc2222":TEXTM}}>
                            {limitHit?"Limit reached":`${v.used}/${v.usageLimit} used`}
                          </span>
                        )}
                        {v.usageLimit===0&&(
                          <span style={{...glass(0.4,6,0.35),borderRadius:6,padding:"2px 8px",
                            fontSize:10,fontWeight:700,color:TEXTM}}>Unlimited</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{marginTop:11,display:"flex",gap:8}}>
                    {isApplied?(
                      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                        gap:6,padding:"8px",borderRadius:10,background:"rgba(6,214,160,0.15)",
                        border:"1px solid rgba(6,214,160,0.30)"}}>
                        <span style={{fontSize:14}}>✅</span>
                        <span style={{fontWeight:800,fontSize:13,color:MINT}}>Applied</span>
                      </div>
                    ):eligible?(
                      <button onClick={()=>tryApply(v)} style={{
                        flex:1,padding:"9px",borderRadius:10,border:"none",cursor:"pointer",
                        background:`linear-gradient(135deg,${CORAL},${ORANGE})`,
                        color:"#fff",fontWeight:800,fontSize:13,
                        fontFamily:"'Nunito',sans-serif",
                        boxShadow:"0 4px 14px rgba(255,107,107,0.30)",
                        transition:"transform 150ms ease",
                      }}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                        Use This Voucher →
                      </button>
                    ):(
                      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                        padding:"8px",borderRadius:10,...glass(0.3,6,0.3)}}>
                        <span style={{fontSize:12,fontWeight:700,color:TEXTM}}>
                          {limitHit?"Limit reached":"Not eligible yet"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}


// ─── Calculator Modal ─────────────────────────────────────────
function CalcModal({open,onClose,total}){
  const [display,setDisplay]=useState("0");
  const [prev,setPrev]=useState(null);
  const [op,setOp]=useState(null);
  const [fresh,setFresh]=useState(false);
  const [tendered,setTendered]=useState("");

  // Reset when modal opens
  useEffect(()=>{
    if(open){ setDisplay("0");setPrev(null);setOp(null);setFresh(false);setTendered(""); }
  },[open]);

  const press=(val)=>{
    if(val==="C"){setDisplay("0");setPrev(null);setOp(null);setFresh(false);return;}
    if(val==="⌫"){setDisplay(d=>d.length>1?d.slice(0,-1):"0");return;}
    if(val==="."){
      if(fresh){setDisplay("0.");setFresh(false);return;}
      if(!display.includes(".")) setDisplay(d=>d+".");
      return;
    }
    if(["+","-","×","÷"].includes(val)){
      setPrev(parseFloat(display));
      setOp(val);
      setFresh(true);
      return;
    }
    if(val==="="){
      if(prev===null||!op) return;
      const cur=parseFloat(display);
      let result=prev;
      if(op==="+") result=prev+cur;
      if(op==="-") result=prev-cur;
      if(op==="×") result=prev*cur;
      if(op==="÷") result=cur!==0?prev/cur:0;
      const rounded=parseFloat(result.toFixed(2));
      setDisplay(String(rounded));
      setPrev(null);setOp(null);setFresh(false);
      return;
    }
    if(val==="%"){
      setDisplay(d=>String(parseFloat(d)/100));
      return;
    }
    if(fresh){ setDisplay(val);setFresh(false); }
    else setDisplay(d=>d==="0"?val:d+val);
  };

  const change=tendered?parseFloat(tendered)-total:null;

  const ROWS=[
    [{l:"C",s:"fn"},{l:"%",s:"fn"},{l:"⌫",s:"fn"},{l:"÷",s:"op"}],
    [{l:"7"},{l:"8"},{l:"9"},{l:"×",s:"op"}],
    [{l:"4"},{l:"5"},{l:"6"},{l:"-",s:"op"}],
    [{l:"1"},{l:"2"},{l:"3"},{l:"+",s:"op"}],
    [{l:"0",wide:true},{l:"."},{l:"=",s:"eq"}],
  ];

  if(!open) return null;

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:105,
      background:"rgba(0,0,0,0.40)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
      animation:"fadeUp 200ms ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        ...glass(0.88,28,0.60),borderRadius:24,width:310,
        boxShadow:"0 24px 60px rgba(0,0,0,0.20)",
        animation:"slideIn 200ms ease",overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{padding:"14px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.28)",
          display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Pacifico',cursive",fontSize:16,color:TEXT}}>🧮 Calculator</div>
            {total>0&&<div style={{fontSize:11,color:TEXTM,fontWeight:600,marginTop:2}}>Order total: <span style={{color:CORAL,fontWeight:900}}>{fmt(total)}</span></div>}
          </div>
          <button onClick={onClose} style={{...glass(0.42,8,0.44),border:"none",borderRadius:8,
            width:26,height:26,cursor:"pointer",fontSize:13,color:TEXTM,fontWeight:800}}>✕</button>
        </div>

        {/* Display */}
        <div style={{padding:"14px 16px 10px",background:"rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:10,fontWeight:700,color:TEXTM,textTransform:"uppercase",
            letterSpacing:"0.05em",marginBottom:2,minHeight:16}}>
            {prev!==null?`${prev} ${op||""}`:"\u00A0"}
          </div>
          <div style={{fontVariantNumeric:"tabular-nums",fontSize:32,fontWeight:900,
            color:TEXT,textAlign:"right",letterSpacing:"-1px",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {display}
          </div>

          {/* Tendered cash input */}
          <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:11,fontWeight:700,color:TEXTM,flexShrink:0}}>Tendered</div>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",
                fontSize:12,fontWeight:800,color:TEXTM}}>₱</span>
              <input type="number" value={tendered}
                onChange={e=>setTendered(e.target.value)}
                placeholder={total>0?String(Math.ceil(total/10)*10):"0"}
                style={{...glass(0.45,10,0.45),borderRadius:8,padding:"6px 10px 6px 22px",
                  fontSize:14,fontWeight:800,width:"100%",outline:"none",color:TEXT,
                  textAlign:"right"}}/>
            </div>
            {total>0&&(
              <button onClick={()=>setTendered(String(Math.ceil(total/10)*10))}
                style={{...glass(0.42,8,0.42),border:"none",borderRadius:7,
                  padding:"5px 9px",cursor:"pointer",fontSize:11,fontWeight:800,color:CORAL,flexShrink:0}}>
                Exact+
              </button>
            )}
          </div>

          {/* Change due */}
          {tendered&&(
            <div style={{marginTop:7,display:"flex",justifyContent:"space-between",
              alignItems:"center",padding:"8px 10px",borderRadius:9,
              background:change>=0?"rgba(6,214,160,0.15)":"rgba(255,107,107,0.12)",
              border:`1px solid ${change>=0?"rgba(6,214,160,0.3)":"rgba(255,107,107,0.3)"}`}}>
              <span style={{fontSize:12,fontWeight:700,color:change>=0?MINT:CORAL}}>
                {change>=0?"Change Due":"Shortage"}
              </span>
              <span style={{fontSize:16,fontWeight:900,color:change>=0?MINT:CORAL}}>
                {fmt(Math.abs(change||0))}
              </span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div style={{padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:8}}>
          {ROWS.map((row,ri)=>(
            <div key={ri} style={{display:"flex",gap:8}}>
              {row.map(btn=>{
                const isFn=btn.s==="fn";
                const isOp=btn.s==="op";
                const isEq=btn.s==="eq";
                return(
                  <button key={btn.l} onClick={()=>press(btn.l)}
                    style={{
                      flex:btn.wide?2:1,
                      padding:"14px 0",borderRadius:12,border:"none",cursor:"pointer",
                      fontWeight:800,fontSize:16,fontFamily:"'Nunito',sans-serif",
                      transition:"all 120ms ease",
                      ...(isEq
                        ?{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",boxShadow:"0 4px 14px rgba(255,107,107,0.30)"}
                        :isOp
                        ?{background:`linear-gradient(135deg,rgba(255,140,66,0.55),rgba(255,107,107,0.55))`,color:"#fff",backdropFilter:"blur(8px)"}
                        :isFn
                        ?{...glass(0.42,8,0.42),color:CORAL}
                        :{...glass(0.50,10,0.45),color:TEXT}),
                    }}
                    onMouseDown={e=>e.currentTarget.style.transform="scale(0.93)"}
                    onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                    {btn.l}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick-fill from order total */}
          {total>0&&(
            <button onClick={()=>{setDisplay(String(total.toFixed(2)));setFresh(false);}}
              style={{width:"100%",padding:"9px",borderRadius:10,border:"none",cursor:"pointer",
                ...glass(0.40,8,0.40),fontSize:12,fontWeight:700,color:TEXTM,marginTop:2}}>
              Load Order Total → {fmt(total)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({open,onClose,cart,setCart,setSales,vouchers,setVouchers,toast,orderCounter,setOrderCounter}){
  const [voucherInput,setVoucherInput]=useState("");
  const [appliedVoucher,setAppliedVoucher]=useState(null);
  const [voucherErr,setVoucherErr]=useState("");
  const [shake,setShake]=useState(false);
  const [note,setNote]=useState("");
  const [voucherDrawerOpen,setVoucherDrawerOpen]=useState(false);
  const [calcOpen,setCalcOpen]=useState(false);

  const items=Object.values(cart).filter(x=>x.qty>0);
  const subtotal=items.reduce((a,{price,qty})=>a+price*qty,0);
  let discount=0;
  if(appliedVoucher){
    if(appliedVoucher.type==="percent") discount=Math.round(subtotal*(appliedVoucher.value/100)*100)/100;
    else discount=Math.min(appliedVoucher.value,subtotal);
  }
  const total=subtotal-discount;
  const count=items.reduce((a,{qty})=>a+qty,0);

  const setQty=(key,qty)=>{
    if(qty<=0){setCart(p=>{const n={...p};delete n[key];return n;});}
    else setCart(p=>({...p,[key]:{...p[key],qty}}));
  };

  const doShake=()=>{setShake(true);setTimeout(()=>setShake(false),500);};

  const applyVoucher=()=>{
    const code=voucherInput.toUpperCase().trim();
    if(!code){setVoucherErr("Enter a code");doShake();return;}
    const v=vouchers.find(v=>v.code===code);
    if(!v){setVoucherErr("Code not found");doShake();return;}
    if(!v.active){setVoucherErr("Voucher inactive");doShake();return;}
    if(v.usageLimit>0&&v.used>=v.usageLimit){setVoucherErr("Usage limit reached");doShake();return;}
    if(v.minOrder>0&&subtotal<v.minOrder){setVoucherErr(`Min order ${fmt(v.minOrder)}`);doShake();return;}
    setAppliedVoucher(v);setVoucherErr("");setVoucherInput("");
    toast(`🎟️ "${code}" applied!`);
  };

  const removeVoucher=()=>{setAppliedVoucher(null);setVoucherErr("");setVoucherInput("");};

  const resetAll=()=>{
    setCart({});setNote("");removeVoucher();setVoucherDrawerOpen(false);
  };

  const handleClose=()=>{onClose();setVoucherDrawerOpen(false);};

  const checkout=()=>{
    const num=orderCounter+1;
    const sale={
      id:`s${Date.now()}`,orderNum:num,
      items:items.map(({menuId,name,emoji,size,basePrice,price,addons,qty})=>({id:menuId,name,emoji,size,basePrice,price,addons,qty})),
      subtotal,discount,total:parseFloat(total.toFixed(2)),
      voucher:appliedVoucher?.code||null,ts:Date.now(),note,
    };
    if(appliedVoucher) setVouchers(p=>p.map(v=>v.id===appliedVoucher.id?{...v,used:v.used+1}:v));
    setSales(p=>[...p,sale]);
    setOrderCounter(num);
    setCart({});setNote("");setAppliedVoucher(null);setVoucherInput("");setVoucherDrawerOpen(false);
    onClose();
    toast(`🎉 Order #${num} placed · ${fmt(total)}`);
  };

  return(
    <>
      {/* Main overlay */}
      <div onClick={handleClose} style={{
        position:"fixed",inset:0,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(3px)",
        zIndex:80,opacity:open?1:0,pointerEvents:open?"all":"none",transition:"opacity 240ms ease",
      }}/>

      {/* Cart drawer */}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,width:440,maxWidth:"94vw",
        ...glass(0.84,28,0.52),zIndex:90,display:"flex",flexDirection:"column",
        transform:open?"translateX(0)":"translateX(102%)",
        transition:"transform 300ms cubic-bezier(0.4,0,0.2,1)",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.08)",
      }}>

        {/* Header */}
        <div style={{padding:"17px 20px 13px",borderBottom:"1px solid rgba(255,255,255,0.3)",flexShrink:0,display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontFamily:"'Pacifico',cursive",fontSize:19,color:TEXT,flex:1}}>🛒 Order</span>
          {count>0&&<span style={{background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",borderRadius:12,fontSize:11,fontWeight:900,padding:"2px 8px"}}>{count}</span>}
          {/* Calculator icon button */}
          <button onClick={()=>setCalcOpen(true)} title="Calculator" style={{
            ...glass(0.42,8,0.44),border:"none",borderRadius:8,
            width:28,height:28,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,transition:"all 150ms",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke={TEXTM} strokeWidth="1.3" fill="none"/>
              <rect x="3" y="3" width="3.5" height="2" rx="0.6" fill={CORAL}/>
              <rect x="7.5" y="3" width="3.5" height="2" rx="0.6" fill={TEXTM} opacity="0.5"/>
              <rect x="3" y="6.5" width="2" height="1.5" rx="0.5" fill={TEXTM} opacity="0.6"/>
              <rect x="6" y="6.5" width="2" height="1.5" rx="0.5" fill={TEXTM} opacity="0.6"/>
              <rect x="9" y="6.5" width="2" height="1.5" rx="0.5" fill={TEXTM} opacity="0.6"/>
              <rect x="3" y="9.5" width="2" height="1.5" rx="0.5" fill={TEXTM} opacity="0.6"/>
              <rect x="6" y="9.5" width="2" height="1.5" rx="0.5" fill={TEXTM} opacity="0.6"/>
              <rect x="9" y="9.5" width="2" height="1.5" rx="0.5" fill={CORAL} opacity="0.7"/>
            </svg>
          </button>
          <button onClick={handleClose} style={{...glass(0.42,8,0.44),border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,color:TEXTM,fontWeight:800}}>✕</button>
        </div>

        {/* Items */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 20px"}}>
          {items.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:TEXTM}}>
              <div style={{fontSize:44,marginBottom:9}}>☕</div>
              <div style={{fontWeight:800,fontSize:14}}>Cart is empty</div>
              <div style={{fontSize:12,marginTop:4,color:TEXTL}}>Tap menu items to add them</div>
            </div>
          )}
          {items.map((it)=>(
            <div key={it.key} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.22)"}}>
              <div style={{...glass(0.48,8,0.38),borderRadius:9,width:34,height:34,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{it.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:13,color:TEXT}}>
                  {it.name}
                  {it.size?<span style={{marginLeft:5,...glass(0.45,6,0.4),borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800,color:ORANGE}}>({it.size[0]})</span>:""}
                </div>
                {it.addons&&it.addons.length>0&&<div style={{fontSize:11,color:TEXTM,marginTop:2}}>+ {it.addons.map(a=>a.name).join(", ")}</div>}
                <div style={{fontSize:11,color:TEXTL,marginTop:1}}>{fmt(it.price)} each</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <button onClick={()=>setQty(it.key,it.qty-1)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontWeight:900,fontSize:15,color:CORAL}}>−</button>
                <span style={{fontWeight:900,fontSize:13,minWidth:16,textAlign:"center"}}>{it.qty}</span>
                <button onClick={()=>setQty(it.key,it.qty+1)} style={{...glass(0.42,8,0.42),border:"none",borderRadius:6,width:24,height:24,cursor:"pointer",fontWeight:900,fontSize:15,color:MINT}}>+</button>
              </div>
              <span style={{fontWeight:900,fontSize:13,color:CORAL,minWidth:48,textAlign:"right"}}>{fmt(it.price*it.qty)}</span>
            </div>
          ))}
          {items.length>0&&(
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Order notes…" rows={2}
              style={{...glass(0.42,10,0.44),borderRadius:10,padding:"8px 11px",fontSize:13,color:TEXT,
                fontWeight:600,width:"100%",resize:"none",marginTop:11,outline:"none"}}/>
          )}
        </div>

        {/* Footer */}
        {items.length>0&&(
          <div style={{padding:"13px 20px 20px",borderTop:"1px solid rgba(255,255,255,0.28)",flexShrink:0}}>

            {/* ── Promo code section ── */}
            <div style={{marginBottom:11}}>
              <div style={{fontSize:10,fontWeight:800,color:TEXTM,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.05em"}}>🎟️ Promo Code</div>

              {appliedVoucher?(
                /* Applied state */
                <div style={{
                  ...glass(0.55,12,0.50),borderRadius:12,padding:"10px 13px",
                  background:"rgba(6,214,160,0.14)",border:"1.5px solid rgba(6,214,160,0.40)",
                  display:"flex",alignItems:"center",gap:10,
                }}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:900,fontSize:13,color:MINT,letterSpacing:"0.04em"}}>{appliedVoucher.code}</div>
                    <div style={{fontSize:11,color:TEXTM,fontWeight:600,marginTop:1}}>{appliedVoucher.desc}</div>
                  </div>
                  <div style={{fontWeight:900,fontSize:14,color:MINT}}>−{fmt(discount)}</div>
                  <button onClick={removeVoucher} style={{
                    ...glass(0.42,8,0.42),border:"none",borderRadius:7,
                    width:26,height:26,cursor:"pointer",fontSize:13,color:TEXTM,fontWeight:800,
                  }}>✕</button>
                </div>
              ):(
                /* Two-action row */
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {/* Manual code input */}
                  <div style={{display:"flex",gap:7,animation:shake?"shake 400ms ease":undefined}}>
                    <input
                      value={voucherInput}
                      onChange={e=>{setVoucherInput(e.target.value.toUpperCase());setVoucherErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&applyVoucher()}
                      placeholder="Enter code…"
                      style={{
                        ...glass(0.48,12,0.50),borderRadius:9,padding:"9px 12px",
                        fontSize:13,color:TEXT,fontWeight:800,flex:1,outline:"none",
                        textTransform:"uppercase",letterSpacing:"0.07em",
                        border:voucherErr?"1px solid rgba(255,107,107,0.50)":"1px solid rgba(255,255,255,0.45)",
                      }}
                    />
                    <button onClick={applyVoucher} style={{
                      background:`linear-gradient(135deg,${MINT},${SKY})`,color:"#fff",
                      border:"none",borderRadius:9,padding:"9px 14px",cursor:"pointer",
                      fontWeight:800,fontSize:12,flexShrink:0,
                    }}>Apply</button>
                  </div>
                  {voucherErr&&<div style={{fontSize:11,color:CORAL,fontWeight:700,marginTop:-2}}>{voucherErr}</div>}

                  {/* Select voucher button */}
                  <button onClick={()=>setVoucherDrawerOpen(true)} style={{
                    width:"100%",padding:"9px 13px",borderRadius:10,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:9,textAlign:"left",
                    ...glass(0.40,10,0.44),
                    border:"1.5px dashed rgba(255,107,107,0.38)",
                    transition:"all 160ms ease",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.52)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.40)";}}>
                    <span style={{fontSize:18}}>🎟️</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:13,color:TEXT}}>Select Voucher</div>
                      <div style={{fontSize:11,color:TEXTM,fontWeight:600}}>
                        {vouchers.filter(v=>v.active).length} active promo{vouchers.filter(v=>v.active).length!==1?"s":""} available
                      </div>
                    </div>
                    <span style={{fontSize:15,color:CORAL,fontWeight:900}}>→</span>
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{...glass(0.35,8,0.35),borderRadius:11,padding:"11px 13px",marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,color:TEXTM,marginBottom:4}}>
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {discount>0&&(
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:MINT,marginBottom:4}}>
                  <span>🎟️ {appliedVoucher?.code}</span><span>−{fmt(discount)}</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:17,fontWeight:900,color:TEXT,borderTop:"1px solid rgba(255,255,255,0.3)",paddingTop:7,marginTop:3}}>
                <span>Total</span><span style={{color:CORAL}}>{fmt(total)}</span>
              </div>
            </div>

            <button onClick={checkout}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:"pointer",
                background:`linear-gradient(135deg,${CORAL},${ORANGE})`,color:"#fff",
                fontWeight:900,fontSize:14,fontFamily:"'Nunito',sans-serif",
                boxShadow:"0 6px 22px rgba(255,107,107,0.38)",transition:"transform 150ms ease",
              }}>
              Place Order · {fmt(total)}
            </button>
            <button onClick={resetAll} style={{
              width:"100%",marginTop:7,padding:"8px",borderRadius:10,
              ...glass(0.38,8,0.38),border:"none",cursor:"pointer",fontWeight:700,fontSize:11,color:TEXTM,
            }}>Clear order</button>
          </div>
        )}
      </div>

      {/* Voucher drawer — stacks over the cart drawer */}
      <VoucherDrawer
        open={voucherDrawerOpen}
        onClose={()=>setVoucherDrawerOpen(false)}
        vouchers={vouchers}
        subtotal={subtotal}
        applied={appliedVoucher}
        onApply={(v)=>{
          setAppliedVoucher(v);
          setVoucherInput("");
          setVoucherErr("");
          toast(`🎟️ "${v.code}" applied!`);
        }}
      />

      {/* Calculator modal */}
      <CalcModal open={calcOpen} onClose={()=>setCalcOpen(false)} total={total}/>
    </>
  );
}


// ─── Root ─────────────────────────────────────────────────────
export default function App(){
  const [darkMode,setDarkMode]   =useState(()=>store.get("pos_dark",false));
  const [menu,setMenu]           =useState(()=>store.get("pos_menu2",DEFAULT_MENU));
  const [addons,setAddons]       =useState(()=>store.get("pos_addons",DEFAULT_ADDONS));
  const [sales,setSales]         =useState(()=>store.get("pos_sales2",DEFAULT_SALES));
  const [vouchers,setVouchers]   =useState(()=>store.get("pos_vouchers",DEFAULT_VOUCHERS));
  const [posName,setPosName]     =useState(()=>store.get("pos_name","Brew POS"));
  const [settings,setSettings]   =useState(()=>store.get("pos_settings2",{tagline:"Your summer café companion",staffName:"Barista 1",terminal:"Main Counter"}));
  const [orderCounter,setOrderCounter]=useState(()=>store.get("pos_order_counter",DEFAULT_SALES.length));
  const [cart,setCart]           =useState({});
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [tab,setTab]             =useState("pos");
  const [toastMsg,setToastMsg]   =useState(null);

  useEffect(()=>store.set("pos_dark",darkMode),[darkMode]);
  useEffect(()=>store.set("pos_menu2",menu),[menu]);
  useEffect(()=>store.set("pos_addons",addons),[addons]);
  useEffect(()=>store.set("pos_sales2",sales),[sales]);
  useEffect(()=>store.set("pos_vouchers",vouchers),[vouchers]);
  useEffect(()=>store.set("pos_name",posName),[posName]);
  useEffect(()=>store.set("pos_settings2",settings),[settings]);
  useEffect(()=>store.set("pos_order_counter",orderCounter),[orderCounter]);

  const showToast=(m)=>{setToastMsg(m);setTimeout(()=>setToastMsg(null),2300);};

  const cartCount=Object.values(cart).reduce((a,{qty})=>a+qty,0);
  const cartSub=Object.values(cart).reduce((a,{price,qty})=>a+price*qty,0);

  const TABS=[
    {id:"pos",       icon:"☕", label:"POS"},
    {id:"orders",    icon:"🧾", label:"Orders"},
    {id:"log",       icon:"📋", label:"Log"},
    {id:"analytics", icon:"📊", label:"Analytics"},
    {id:"admin",     icon:"⚙️", label:"Admin"},
    {id:"settings",  icon:"🎛️", label:"Settings"},
  ];

  const sideStats=[
    {label:"Revenue",  val:fmt(sales.reduce((a,s)=>a+s.total,0))},
    {label:"Orders",   val:sales.length},
    {label:"Avg",      val:fmt(sales.length?sales.reduce((a,s)=>a+s.total,0)/sales.length:0)},
  ];

  return(
    <>
      <style>{GCSS}</style>
      {darkMode&&<style>{`
        body{color-scheme:dark;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);}
      `}</style>}
      {darkMode?<DarkBg/>:<SummerBg/>}
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",transition:"background 500ms ease",color:darkMode?"#e8d5c0":TEXT}}>

        {/* Navbar */}
        <header style={{...glass(darkMode?0.18:0.48,22,darkMode?0.15:0.48),background:darkMode?"rgba(15,10,35,0.75)":undefined,borderBottom:"1px solid rgba(255,255,255,0.36)",height:52,display:"flex",alignItems:"center",padding:"0 16px",gap:10,flexShrink:0,zIndex:20}}>
          <div style={{fontFamily:"'Pacifico',cursive",fontSize:19,color:CORAL,marginRight:4,textShadow:"0 1px 8px rgba(255,107,107,0.22)"}}>{posName}</div>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.4)"}}/>
          <div style={{display:"flex",gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:800,fontSize:11,transition:"all 150ms",fontFamily:"'Nunito',sans-serif",...(tab===t.id?{background:"rgba(255,255,255,0.72)",color:TEXT,boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}:{background:"transparent",color:TEXTM})}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div style={{flex:1}}/>
          <Clock/>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.4)"}}/>
          <button onClick={()=>setDarkMode(d=>!d)} title={darkMode?"Switch to Light":"Switch to Dark"} style={{
            ...glass(0.40,10,0.44),border:"none",borderRadius:10,
            width:32,height:32,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,transition:"all 200ms ease",
            background:darkMode?"rgba(255,209,102,0.25)":"rgba(30,20,60,0.18)",
          }}>{darkMode?"☀️":"🌙"}</button>
          <div style={{width:1,height:20,background:"rgba(255,255,255,0.4)"}}/>
          <button onClick={()=>setDrawerOpen(true)} style={{...glass(cartCount>0?0.72:0.42,10,0.52),border:"none",borderRadius:10,padding:"6px 13px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontWeight:800,fontSize:11,transition:"all 200ms",fontFamily:"'Nunito',sans-serif",...(cartCount>0?{background:`linear-gradient(135deg,rgba(255,107,107,0.82),rgba(255,140,66,0.82))`,color:"#fff"}:{color:TEXTM})}}>
            🛒{cartCount>0?<><span>{cartCount}</span><span style={{opacity:.75}}>·</span><span>{fmt(cartSub)}</span></>:<span>Cart</span>}
          </button>
        </header>

        {/* Body */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Sidebar */}
          <aside style={{...glass(darkMode?0.12:0.32,16,darkMode?0.10:0.32),background:darkMode?"rgba(10,5,25,0.60)":undefined,borderRight:"1px solid rgba(255,255,255,0.3)",width:175,flexShrink:0,display:"flex",flexDirection:"column",padding:"11px 0",overflowY:"auto",zIndex:10}}>
            <div style={{padding:"0 11px",marginBottom:4,fontSize:10,fontWeight:900,color:TEXTL,letterSpacing:"0.07em",textTransform:"uppercase"}}>Navigate</div>
            {TABS.map(t=>(
              <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",cursor:"pointer",borderRight:tab===t.id?`3px solid ${CORAL}`:"3px solid transparent",background:tab===t.id?"rgba(255,255,255,0.35)":"transparent",transition:"all 140ms",fontWeight:tab===t.id?800:500,fontSize:12,color:tab===t.id?TEXT:TEXTM}}>
                <span style={{fontSize:16}}>{t.icon}</span>{t.label}
              </div>
            ))}
            <div style={{height:1,background:"rgba(255,255,255,0.3)",margin:"9px 11px"}}/>
            <div style={{padding:"0 11px",marginBottom:5,fontSize:10,fontWeight:900,color:TEXTL,letterSpacing:"0.07em",textTransform:"uppercase"}}>Today</div>
            {sideStats.map(s=>(
              <div key={s.label} style={{padding:"4px 11px"}}>
                <div style={{fontSize:9,color:TEXTL,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:1}}>{s.label}</div>
                <div style={{fontSize:16,fontWeight:900,color:CORAL,letterSpacing:"-0.5px"}}>{s.val}</div>
              </div>
            ))}
            <div style={{flex:1}}/>
            <div style={{padding:"0 11px",marginTop:9}}>
              <div style={{...glass(0.42,10,0.42),borderRadius:11,padding:"9px",textAlign:"center"}}>
                <div style={{fontSize:10,color:TEXTM,fontWeight:800}}>{settings.staffName||"Barista 1"}</div>
                <div style={{fontSize:9,color:TEXTL}}>{settings.terminal||"Main Counter"}</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",...glass(darkMode?0.08:0.20,10,darkMode?0.06:0.18),background:darkMode?"rgba(10,5,25,0.40)":undefined}}>
            {tab==="pos"       &&<POSSection       menu={menu} addons={addons} cart={cart} setCart={setCart} posName={posName}/>}
            {tab==="orders"    &&<OrdersSection    sales={sales}/>}
            {tab==="log"       &&<RecentLogSection sales={sales}/>}
            {tab==="analytics" &&<AnalyticsSection sales={sales} setSales={setSales} menu={menu}/>}
            {tab==="admin"     &&<AdminSection     menu={menu} setMenu={setMenu} addons={addons} setAddons={setAddons} vouchers={vouchers} setVouchers={setVouchers} toast={showToast}/>}
            {tab==="settings"  &&<SettingsSection  posName={posName} setPosName={setPosName} settings={settings} setSettings={setSettings} toast={showToast}/>}
          </main>
        </div>

        {/* Footer */}
        <footer style={{...glass(darkMode?0.12:0.32,14,darkMode?0.10:0.32),background:darkMode?"rgba(10,5,25,0.60)":undefined,borderTop:"1px solid rgba(255,255,255,0.3)",height:34,display:"flex",alignItems:"center",padding:"0 16px",gap:11,flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:800,color:TEXTM}}>{posName} v3.0</span>
          <span style={{color:"rgba(255,255,255,0.4)"}}>|</span>
          <span style={{fontSize:11,color:TEXTM}}>{settings.staffName}</span>
          <span style={{color:"rgba(255,255,255,0.4)"}}>|</span>
          <span style={{fontSize:11,color:TEXTM}}>{settings.terminal}</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:11,fontWeight:700,color:TEXT}}>{new Date().toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</span>
        </footer>
      </div>

      <CartDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} cart={cart} setCart={setCart} setSales={setSales} vouchers={vouchers} setVouchers={setVouchers} toast={showToast} orderCounter={orderCounter} setOrderCounter={setOrderCounter}/>
      <Toast msg={toastMsg}/>
    </>
  );
}
