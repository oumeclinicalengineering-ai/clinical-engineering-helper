export function calculatePE(weight:number,ht:number,mode:string,value:number,fluid:string,bags:number[]){
 if(!Number.isFinite(weight)||weight<=0||!Number.isFinite(ht)||ht<=0||ht>=100)throw Error('体重は0より大きい値、Htは0より大きく100未満で入力してください。');
 const pv=weight/13*(1-ht/100);
 if(!Number.isFinite(value)||value<=0)throw Error('設定値は0より大きい数値を入力してください。');
 if(bags.some(n=>!Number.isInteger(n)||n<0))throw Error('FFP袋数は0以上の整数で入力してください。');
 if(mode==='pv'&&(value<1||value>2||Math.abs(value*10-Math.round(value*10))>1e-8))throw Error('設定PV倍率は1.0〜2.0の0.1刻みで選択してください。');
 if(mode==='products'&&fluid==='ffp'&&!Number.isInteger(value))throw Error('FFP総単位数は整数で入力してください。');
 const ml=mode==='pv'?pv*value*1000:mode==='volume'?value*1000:fluid==='alb'?value*250:value*120;
 if(!Number.isFinite(ml)||ml<=0)throw Error('使用予定量を確認してください。');
 const multiple=ml/1000/pv;
 return {pv,ml,multiple,removal:100*(1-Math.exp(-multiple)),units:ml/120,albBottles:ml/250,prepareAlb:Math.ceil(Math.round(ml/250*1e9)/1e9),albGrams:ml*.05,ffpPrepared:bags.reduce((s,n,i)=>s+n*[120,240,480][i],0)};
}
