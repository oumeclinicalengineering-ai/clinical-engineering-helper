export function Guide({message,compact=false}:{message:string;compact?:boolean}){
 const terms=/^(血液浄化|呼吸器業務|機器管理|アイノフロー|平均回路流量|NO設定濃度|使用可能時間|PE置換量計算)$/;
 const parts=message.split(/(血液浄化|呼吸器業務|機器管理|アイノフロー|平均回路流量|NO設定濃度|使用可能時間|PE置換量計算)/g);
 return <aside className={`me-guide${compact?' compact':''}`} aria-label="MEサポくんの操作ガイド"><img src="./images/me-support.png" alt="小さな機器型キャラクター、MEサポくん" width="88" height="88"/><div className="guide-bubble"><small><span>MEサポくん</span>{' · '}<span>操作ガイド</span></small><p>{parts.map((part,i)=>terms.test(part)?<span className="phrase" key={i}>{part}</span>:part)}</p></div></aside>;
}
