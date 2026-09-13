export type Formation={id:string;name:string;description:string;positions:{home:Array<{x:number;y:number}>;away:Array<{x:number;y:number}>}};
export const formations:Formation[]=[
{id:'diamond',name:'الماسة 1-2-1',description:'توازن بين الخروج بالكرة وفتح الأطراف.',positions:{home:[{x:8,y:50},{x:26,y:50},{x:48,y:24},{x:48,y:76},{x:72,y:50}],away:[{x:92,y:50},{x:74,y:50},{x:52,y:24},{x:52,y:76},{x:28,y:50}]}},
{id:'square',name:'المربع 2-2',description:'إغلاق العمق والاعتماد على المرتدات.',positions:{home:[{x:8,y:50},{x:30,y:28},{x:30,y:72},{x:62,y:28},{x:62,y:72}],away:[{x:92,y:50},{x:70,y:28},{x:70,y:72},{x:38,y:28},{x:38,y:72}]}},
{id:'pyramid',name:'الهرم 2-1-1',description:'ارتكاز واضح يربط الدفاع بالهجوم.',positions:{home:[{x:8,y:50},{x:28,y:30},{x:28,y:70},{x:48,y:50},{x:72,y:50}],away:[{x:92,y:50},{x:72,y:30},{x:72,y:70},{x:52,y:50},{x:28,y:50}]}},
{id:'yPress',name:'ضغط Y',description:'ضغط عالي لإجبار الخصم على الغلط.',positions:{home:[{x:8,y:50},{x:36,y:50},{x:60,y:24},{x:60,y:76},{x:82,y:50}],away:[{x:92,y:50},{x:64,y:50},{x:40,y:24},{x:40,y:76},{x:18,y:50}]}},
{id:'counter',name:'مرتدة 2-1-1',description:'كتلة منخفضة ثم خروج سريع خلف الخصم.',positions:{home:[{x:8,y:50},{x:24,y:34},{x:24,y:66},{x:42,y:50},{x:66,y:50}],away:[{x:92,y:50},{x:76,y:34},{x:76,y:66},{x:58,y:50},{x:34,y:50}]}}
];
export const genericTacticalPlayers=Array.from({length:10},(_,i)=>({id:`${i<5?'H':'A'}${i%5+1}`,team:(i<5?'home':'away') as 'home'|'away',name:`Player ${i%5+1}`,x:i<5?[8,25,25,45,70][i]:[92,75,75,55,30][i-5],y:i<5?[50,28,72,50,50][i]:[50,28,72,50,50][i-5],role:['GK','CB','CB','CM','ST'][i%5],teamRole:'',instruction:'',captain:false,positionMode:'auto' as const}));
