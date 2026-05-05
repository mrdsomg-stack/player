const { useState, useMemo } = React;

const COMPETICOES_PADRAO = [
  "Brasileirão","Copa do Brasil","Libertadores","Sul-Americana",
  "La Liga","Copa del Rey","Premier League","FA Cup","League Cup",
  "Bundesliga","DFB Pokal","Serie A","Coppa Italia","Champions League","Europa League",
];

const uid = () => Math.random().toString(36).slice(2,9);

const initTemporada = () => ({
  id: uid(), ano: "",
  ligas: {}, artilheiros: [], assistentes: [],
  premios: [], selecao: [], copas: [], notas: "",
});

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#111210; --bg2:#191917; --bg3:#202020;
  --line:#2a2a28; --line2:#363633;
  --gold:#c9a84c; --gold2:#e8c97a;
  --text:#e8e6e0; --muted:#6b6a64; --muted2:#8f8e88;
  --white:#f5f3ee; --red:#c84b4b; --green:#4f9e6f;
}
html,body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; line-height:1.6; }
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px;}
input,select,textarea {
  background:var(--bg2); color:var(--text); border:1px solid var(--line2);
  padding:8px 12px; font-family:'DM Sans',sans-serif; font-size:13px;
  outline:none; width:100%; transition:border-color .15s; border-radius:0; appearance:none;
}
input:focus,select:focus,textarea:focus { border-color:var(--gold); }
select { cursor:pointer; } select option { background:var(--bg2); }
button { font-family:'DM Sans',sans-serif; cursor:pointer; border:none; transition:all .15s; border-radius:0; letter-spacing:.3px; }
button:hover { opacity:.85; }
table { border-collapse:collapse; width:100%; }
th { font-family:'DM Mono',monospace; font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; padding:10px 12px; border-bottom:1px solid var(--line); text-align:left; font-weight:400; }
td { padding:9px 12px; border-bottom:1px solid var(--line); font-size:13px; color:var(--text); }
tr:last-child td { border-bottom:none; }
tbody tr:hover td { background:var(--bg3); }
.playfair { font-family:'Playfair Display',serif; }
.mono { font-family:'DM Mono',monospace; }
.pill { display:inline-block; padding:1px 8px; font-size:10px; font-family:'DM Mono',monospace; letter-spacing:.5px; border:1px solid; }
@keyframes fadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
.fade { animation:fadeIn .2s ease; }
`;

const posCol = {GOL:"#c9a84c",ZAG:"#4f9e6f",LAT:"#4f7e9e",VOL:"#9e6f4f",MEI:"#7e4f9e",ATA:"#9e4f4f"};

/* ── COMPONENTES BASE ── */
const Divider = ({style={}}) => <div style={{height:1,background:"var(--line)",...style}}/>;

const Label = ({children}) => (
  <div className="mono" style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{children}</div>
);

const Field = ({label,children,style={}}) => (
  <div style={style}><Label>{label}</Label>{children}</div>
);

const Pill = ({children,color="var(--gold)"}) => (
  <span className="pill" style={{color,borderColor:`${color}55`}}>{children}</span>
);

const Btn = ({children,onClick,variant="gold",sm,full,style={}}) => {
  const v = {
    gold:   {bg:"var(--gold)",c:"#111",b:"var(--gold)"},
    outline:{bg:"transparent",c:"var(--muted2)",b:"var(--line2)"},
    ghost:  {bg:"transparent",c:"var(--muted)",b:"transparent"},
    danger: {bg:"transparent",c:"var(--red)",b:"var(--red)"},
    dark:   {bg:"var(--bg3)",c:"var(--text)",b:"var(--line2)"},
  }[variant]||{bg:"var(--gold)",c:"#111",b:"var(--gold)"};
  return (
    <button onClick={onClick} style={{
      background:v.bg,color:v.c,border:`1px solid ${v.b}`,
      padding:sm?"4px 12px":"9px 20px",fontSize:sm?11:13,
      fontWeight:500,width:full?"100%":"auto",...style
    }}>{children}</button>
  );
};

const Panel = ({children,style={}}) => (
  <div style={{background:"var(--bg2)",border:"1px solid var(--line)",padding:0,...style}}>{children}</div>
);

const PanelHead = ({children,right}) => (
  <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <span className="mono" style={{fontSize:9,color:"var(--gold)",textTransform:"uppercase",letterSpacing:2,fontWeight:500}}>{children}</span>
    {right}
  </div>
);

/* ── FORMULÁRIO ── */
function FormTemporada({inicial, todasComps, onSave, onCancel}) {
  const [d, setD]           = useState(() => inicial ? JSON.parse(JSON.stringify(inicial)) : initTemporada());
  const [aba, setAba]       = useState("tabelas");
  const [ligaAtiva, setLA]  = useState(todasComps[0]||COMPETICOES_PADRAO[0]);
  const [novaComp, setNC]   = useState("");
  const [bTab, setBTab]     = useState({clube:"",pts:""});
  const [bArt, setBArt]     = useState({nome:"",clube:"",comp:todasComps[0]||COMPETICOES_PADRAO[0],gols:""});
  const [bAst, setBAst]     = useState({nome:"",clube:"",comp:todasComps[0]||COMPETICOES_PADRAO[0],n:""});
  const [bPrm, setBPrm]     = useState({nome:"",clube:"",comp:todasComps[0]||COMPETICOES_PADRAO[0],titulo:"Melhor Jogador"});
  const [bSel, setBSel]     = useState({pos:"GOL",nome:"",clube:""});
  const [bCop, setBCop]     = useState({comp:"",campeao:"",vice:"",artilheiro:"",gols:"",mvp:""});

  const upd = p => setD(prev=>({...prev,...p}));

  const addTab = () => {
    if(!bTab.clube.trim()) return;
    const rows = d.ligas[ligaAtiva]||[];
    upd({ligas:{...d.ligas,[ligaAtiva]:[...rows,{clube:bTab.clube.trim(),pts:+bTab.pts||0,id:uid()}]}});
    setBTab({clube:"",pts:""});
  };
  const remTab = (comp,id) => upd({ligas:{...d.ligas,[comp]:(d.ligas[comp]||[]).filter(r=>r.id!==id)}});
  const addComp = () => { if(!novaComp.trim()) return; setLA(novaComp.trim()); setNC(""); };

  const addArt = () => { if(!bArt.nome.trim()||!bArt.gols) return; upd({artilheiros:[...d.artilheiros,{...bArt,gols:+bArt.gols,id:uid()}]}); setBArt({...bArt,nome:"",clube:"",gols:""}); };
  const remArt = id => upd({artilheiros:d.artilheiros.filter(x=>x.id!==id)});
  const addAst = () => { if(!bAst.nome.trim()||!bAst.n) return; upd({assistentes:[...d.assistentes,{...bAst,n:+bAst.n,id:uid()}]}); setBAst({...bAst,nome:"",clube:"",n:""}); };
  const remAst = id => upd({assistentes:d.assistentes.filter(x=>x.id!==id)});
  const addPrm = () => { if(!bPrm.nome.trim()) return; upd({premios:[...d.premios,{...bPrm,id:uid()}]}); setBPrm({...bPrm,nome:"",clube:""}); };
  const remPrm = id => upd({premios:d.premios.filter(x=>x.id!==id)});
  const addSel = () => { if(!bSel.nome.trim()) return; upd({selecao:[...d.selecao,{...bSel,id:uid()}]}); setBSel({...bSel,nome:"",clube:""}); };
  const remSel = id => upd({selecao:d.selecao.filter(x=>x.id!==id)});
  const addCop = () => { if(!bCop.comp.trim()||!bCop.campeao.trim()) return; upd({copas:[...d.copas,{...bCop,gols:+bCop.gols||0,id:uid()}]}); setBCop({comp:"",campeao:"",vice:"",artilheiro:"",gols:"",mvp:""}); };
  const remCop = id => upd({copas:d.copas.filter(x=>x.id!==id)});

  const ABAS = [{k:"tabelas",l:"Tabelas"},{k:"artilheiros",l:"Artilheiros"},{k:"assistentes",l:"Assistentes"},{k:"premios",l:"Prêmios"},{k:"selecao",l:"Seleção do Ano"},{k:"copas",l:"Copas"},{k:"notas",l:"Notas"}];
  const sorted = [...(d.ligas[ligaAtiva]||[])].sort((a,b)=>b.pts-a.pts);

  return (
    <div className="fade" style={{maxWidth:800,margin:"0 auto"}}>
      <Panel style={{marginBottom:16}}>
        <PanelHead>Dados da Temporada</PanelHead>
        <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"140px 1fr",gap:12}}>
          <Field label="Ano"><input placeholder="Ex: 2010" value={d.ano} onChange={e=>upd({ano:e.target.value})} maxLength={4}/></Field>
          <Field label="Descrição / Apelido (opcional)"><input placeholder="Ex: O ano do penta do Barcelona..." value={d.apelido||""} onChange={e=>upd({apelido:e.target.value})}/></Field>
        </div>
      </Panel>

      <div style={{display:"flex",borderBottom:"1px solid var(--line)",marginBottom:16,overflowX:"auto"}}>
        {ABAS.map(a=>(
          <button key={a.k} onClick={()=>setAba(a.k)} style={{background:"none",padding:"9px 18px",fontSize:12,fontWeight:500,whiteSpace:"nowrap",color:aba===a.k?"var(--gold)":"var(--muted)",borderBottom:`2px solid ${aba===a.k?"var(--gold)":"transparent"}`}}>{a.l}</button>
        ))}
      </div>

      {aba==="tabelas" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:"0 0 200px"}}>
              <Label>Competição ativa</Label>
              <select value={ligaAtiva} onChange={e=>setLA(e.target.value)}>
                {[...new Set([...todasComps,...COMPETICOES_PADRAO])].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <Label>Ou adicionar nova competição</Label>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="Nome da competição" value={novaComp} onChange={e=>setNC(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComp()}/>
                <Btn sm onClick={addComp} variant="dark">Adicionar</Btn>
              </div>
            </div>
          </div>
          <Panel>
            <PanelHead>{ligaAtiva} <span className="mono" style={{fontSize:9,color:"var(--muted)"}}>{(d.ligas[ligaAtiva]||[]).length} clube(s)</span></PanelHead>
            <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 80px auto",gap:8,alignItems:"end"}}>
                <Field label="Clube"><input placeholder="Nome do clube" value={bTab.clube} onChange={e=>setBTab({...bTab,clube:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addTab()}/></Field>
                <Field label="Pontos"><input placeholder="Pts" type="number" min={0} value={bTab.pts} onChange={e=>setBTab({...bTab,pts:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addTab()}/></Field>
                <Btn onClick={addTab} variant="gold" sm style={{marginBottom:1}}>+ Add</Btn>
              </div>
            </div>
            {sorted.length===0 && <div style={{padding:"32px 16px",textAlign:"center",color:"var(--muted)",fontSize:12}}>Nenhum clube adicionado ainda.</div>}
            {sorted.length>0 && (
              <table>
                <thead><tr><th style={{width:32}}>#</th><th>Clube</th><th style={{width:70}}>Pts</th><th style={{width:36}}></th></tr></thead>
                <tbody>
                  {sorted.map((r,i)=>(
                    <tr key={r.id}>
                      <td><span className="mono" style={{fontSize:11,fontWeight:500,color:i===0?"var(--gold)":i<4?"var(--green)":i>=(sorted.length-3)?"var(--red)":"var(--muted)"}}>{i+1}</span></td>
                      <td style={{fontWeight:i===0?600:400,color:i===0?"var(--gold)":"var(--text)"}}>{i===0&&<span style={{marginRight:6}}>●</span>}{r.clube}</td>
                      <td><span className="mono" style={{color:"var(--gold2)",fontWeight:500}}>{r.pts}</span></td>
                      <td><button onClick={()=>remTab(ligaAtiva,r.id)} style={{background:"none",color:"var(--muted)",fontSize:14,padding:"0 4px"}}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {aba==="artilheiros" && (
        <Panel>
          <PanelHead>Artilheiros</PanelHead>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 70px auto",gap:8,alignItems:"end"}}>
              <Field label="Jogador"><input placeholder="Nome" value={bArt.nome} onChange={e=>setBArt({...bArt,nome:e.target.value})}/></Field>
              <Field label="Clube"><input placeholder="Clube" value={bArt.clube} onChange={e=>setBArt({...bArt,clube:e.target.value})}/></Field>
              <Field label="Competição"><select value={bArt.comp} onChange={e=>setBArt({...bArt,comp:e.target.value})}>{[...new Set([...todasComps,...COMPETICOES_PADRAO])].map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Gols"><input type="number" min={0} value={bArt.gols} onChange={e=>setBArt({...bArt,gols:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addArt()}/></Field>
              <Btn sm onClick={addArt} variant="gold" style={{marginBottom:1}}>+ Add</Btn>
            </div>
          </div>
          <table>
            <thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>Competição</th><th>Gols</th><th></th></tr></thead>
            <tbody>
              {[...d.artilheiros].sort((a,b)=>b.gols-a.gols).map((a,i)=>(
                <tr key={a.id}>
                  <td className="mono" style={{fontSize:11,color:"var(--muted)"}}>{i+1}</td>
                  <td style={{fontWeight:500}}>{a.nome}</td>
                  <td style={{color:"var(--muted2)"}}>{a.clube}</td>
                  <td><Pill>{a.comp}</Pill></td>
                  <td><span className="mono" style={{color:"var(--green)",fontWeight:500}}>{a.gols}</span></td>
                  <td><button onClick={()=>remArt(a.id)} style={{background:"none",color:"var(--muted)",fontSize:14}}>×</button></td>
                </tr>
              ))}
              {!d.artilheiros.length&&<tr><td colSpan={6} style={{textAlign:"center",color:"var(--muted)",padding:"24px"}}>Nenhum artilheiro registrado.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      {aba==="assistentes" && (
        <Panel>
          <PanelHead>Assistentes</PanelHead>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 70px auto",gap:8,alignItems:"end"}}>
              <Field label="Jogador"><input placeholder="Nome" value={bAst.nome} onChange={e=>setBAst({...bAst,nome:e.target.value})}/></Field>
              <Field label="Clube"><input placeholder="Clube" value={bAst.clube} onChange={e=>setBAst({...bAst,clube:e.target.value})}/></Field>
              <Field label="Competição"><select value={bAst.comp} onChange={e=>setBAst({...bAst,comp:e.target.value})}>{[...new Set([...todasComps,...COMPETICOES_PADRAO])].map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Assists."><input type="number" min={0} value={bAst.n} onChange={e=>setBAst({...bAst,n:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addAst()}/></Field>
              <Btn sm onClick={addAst} variant="gold" style={{marginBottom:1}}>+ Add</Btn>
            </div>
          </div>
          <table>
            <thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>Competição</th><th>Assists.</th><th></th></tr></thead>
            <tbody>
              {[...d.assistentes].sort((a,b)=>b.n-a.n).map((a,i)=>(
                <tr key={a.id}>
                  <td className="mono" style={{fontSize:11,color:"var(--muted)"}}>{i+1}</td>
                  <td style={{fontWeight:500}}>{a.nome}</td>
                  <td style={{color:"var(--muted2)"}}>{a.clube}</td>
                  <td><Pill color="var(--muted2)">{a.comp}</Pill></td>
                  <td><span className="mono" style={{color:"var(--gold2)",fontWeight:500}}>{a.n}</span></td>
                  <td><button onClick={()=>remAst(a.id)} style={{background:"none",color:"var(--muted)",fontSize:14}}>×</button></td>
                </tr>
              ))}
              {!d.assistentes.length&&<tr><td colSpan={6} style={{textAlign:"center",color:"var(--muted)",padding:"24px"}}>Nenhum assistente registrado.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      {aba==="premios" && (
        <Panel>
          <PanelHead>Prêmios Individuais</PanelHead>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
              <Field label="Jogador"><input placeholder="Nome" value={bPrm.nome} onChange={e=>setBPrm({...bPrm,nome:e.target.value})}/></Field>
              <Field label="Clube"><input placeholder="Clube" value={bPrm.clube} onChange={e=>setBPrm({...bPrm,clube:e.target.value})}/></Field>
              <Field label="Competição"><select value={bPrm.comp} onChange={e=>setBPrm({...bPrm,comp:e.target.value})}>{[...new Set([...todasComps,...COMPETICOES_PADRAO])].map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Prêmio"><input placeholder="Ex: MVP" value={bPrm.titulo} onChange={e=>setBPrm({...bPrm,titulo:e.target.value})}/></Field>
              <Btn sm onClick={addPrm} variant="gold" style={{marginBottom:1}}>+ Add</Btn>
            </div>
          </div>
          <table>
            <thead><tr><th>Jogador</th><th>Clube</th><th>Competição</th><th>Prêmio</th><th></th></tr></thead>
            <tbody>
              {d.premios.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:600,color:"var(--gold2)"}}>{p.nome}</td>
                  <td style={{color:"var(--muted2)"}}>{p.clube}</td>
                  <td><Pill>{p.comp}</Pill></td>
                  <td><Pill color="var(--gold)">{p.titulo}</Pill></td>
                  <td><button onClick={()=>remPrm(p.id)} style={{background:"none",color:"var(--muted)",fontSize:14}}>×</button></td>
                </tr>
              ))}
              {!d.premios.length&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--muted)",padding:"24px"}}>Nenhum prêmio registrado.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      {aba==="selecao" && (
        <Panel>
          <PanelHead>Seleção do Ano</PanelHead>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
            <div style={{display:"grid",gridTemplateColumns:"90px 1.5fr 1fr auto",gap:8,alignItems:"end"}}>
              <Field label="Posição"><select value={bSel.pos} onChange={e=>setBSel({...bSel,pos:e.target.value})}>{["GOL","ZAG","LAT","VOL","MEI","ATA"].map(p=><option key={p}>{p}</option>)}</select></Field>
              <Field label="Jogador"><input placeholder="Nome" value={bSel.nome} onChange={e=>setBSel({...bSel,nome:e.target.value})}/></Field>
              <Field label="Clube"><input placeholder="Clube" value={bSel.clube} onChange={e=>setBSel({...bSel,clube:e.target.value})}/></Field>
              <Btn sm onClick={addSel} variant="gold" style={{marginBottom:1}}>+ Add</Btn>
            </div>
          </div>
          <div style={{padding:"16px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
            {!d.selecao.length&&<div style={{gridColumn:"1/-1",textAlign:"center",color:"var(--muted)",padding:"20px",fontSize:12}}>Seleção vazia.</div>}
            {["GOL","ZAG","LAT","VOL","MEI","ATA"].flatMap(pos=>d.selecao.filter(s=>s.pos===pos)).map(s=>(
              <div key={s.id} style={{border:"1px solid var(--line2)",padding:"10px 12px",background:"var(--bg3)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:posCol[s.pos]||"var(--gold)",letterSpacing:1}}>{s.pos}</span>
                  <button onClick={()=>remSel(s.id)} style={{background:"none",color:"var(--muted)",fontSize:12}}>×</button>
                </div>
                <div style={{fontWeight:600,fontSize:13}}>{s.nome}</div>
                <div style={{fontSize:11,color:"var(--muted2)",marginTop:1}}>{s.clube}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {aba==="copas" && (
        <Panel>
          <PanelHead>Campeões de Copa / Torneios</PanelHead>
          <div style={{padding:"12px 16px",borderBottom:"1px solid var(--line)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <Field label="Competição"><input placeholder="Ex: Copa do Brasil" value={bCop.comp} onChange={e=>setBCop({...bCop,comp:e.target.value})}/></Field>
              <Field label="Campeão"><input placeholder="Nome do clube" value={bCop.campeao} onChange={e=>setBCop({...bCop,campeao:e.target.value})}/></Field>
              <Field label="Vice (opcional)"><input placeholder="Nome do clube" value={bCop.vice} onChange={e=>setBCop({...bCop,vice:e.target.value})}/></Field>
              <Field label="Artilheiro da copa"><input placeholder="Nome" value={bCop.artilheiro} onChange={e=>setBCop({...bCop,artilheiro:e.target.value})}/></Field>
              <Field label="Gols"><input type="number" min={0} value={bCop.gols} onChange={e=>setBCop({...bCop,gols:e.target.value})}/></Field>
              <Field label="MVP da copa"><input placeholder="Nome" value={bCop.mvp} onChange={e=>setBCop({...bCop,mvp:e.target.value})}/></Field>
            </div>
            <Btn onClick={addCop} variant="gold">+ Adicionar Copa</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))"}}>
            {!d.copas.length&&<div style={{padding:"24px",color:"var(--muted)",fontSize:12,textAlign:"center",gridColumn:"1/-1"}}>Nenhuma copa registrada.</div>}
            {d.copas.map((c,i)=>(
              <div key={c.id} style={{padding:"16px",borderRight:i%2===0?"1px solid var(--line)":"none",borderBottom:"1px solid var(--line)"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span className="mono" style={{fontSize:9,color:"var(--gold)",letterSpacing:1,textTransform:"uppercase"}}>{c.comp}</span>
                  <button onClick={()=>remCop(c.id)} style={{background:"none",color:"var(--muted)",fontSize:14}}>×</button>
                </div>
                <div style={{fontSize:16,fontWeight:700,marginTop:6,color:"var(--white)"}}>{c.campeao}</div>
                {c.vice&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Vice: {c.vice}</div>}
                <Divider style={{margin:"8px 0"}}/>
                {c.artilheiro&&<div style={{fontSize:12,color:"var(--muted2)"}}>⚽ {c.artilheiro} — {c.gols}g</div>}
                {c.mvp&&<div style={{fontSize:12,color:"var(--muted2)"}}>★ MVP: {c.mvp}</div>}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {aba==="notas" && (
        <Panel>
          <PanelHead>Notas da Temporada</PanelHead>
          <div style={{padding:"14px 16px"}}>
            <textarea value={d.notas} onChange={e=>upd({notas:e.target.value})} rows={10} placeholder="Transferências marcantes, recordes, curiosidades..."/>
          </div>
        </Panel>
      )}

      <div style={{display:"flex",gap:10,marginTop:16}}>
        <Btn full onClick={()=>{ if(!d.ano.trim()){alert("Informe o ano da temporada.");return;} onSave(d); }} style={{padding:"12px",fontSize:14,fontWeight:600}}>
          Salvar Temporada {d.ano}
        </Btn>
        <Btn variant="outline" onClick={onCancel} style={{padding:"12px 24px"}}>Cancelar</Btn>
      </div>
    </div>
  );
}

/* ── VER TEMPORADA ── */
function VerTemporada({t, onEdit, onDelete, onBack}) {
  const [aba, setAba] = useState("resumo");
  const ligasComDados = Object.keys(t.ligas).filter(l=>(t.ligas[l]||[]).length>0);
  const [ligaVer, setLV] = useState(ligasComDados[0]||"");

  const ABAS = [
    {k:"resumo",l:"Resumo"},
    ...(ligasComDados.length>0?[{k:"tabelas",l:"Tabelas"}]:[]),
    ...(t.artilheiros.length||t.assistentes.length?[{k:"stats",l:"Stats"}]:[]),
    ...(t.selecao.length?[{k:"selecao",l:"Seleção"}]:[]),
    ...(t.copas.length?[{k:"copas",l:"Copas"}]:[]),
    ...(t.notas?[{k:"notas",l:"Notas"}]:[]),
  ];

  const campeoes = Object.fromEntries(
    ligasComDados.map(l=>{
      const top=[...(t.ligas[l]||[])].sort((a,b)=>b.pts-a.pts)[0];
      return [l,top?.clube||""];
    })
  );

  return (
    <div className="fade">
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
          <div>
            <div className="playfair" style={{fontSize:56,fontWeight:900,color:"var(--gold)",lineHeight:1,letterSpacing:-1}}>{t.ano}</div>
            {t.apelido&&<div style={{fontSize:13,color:"var(--muted2)",marginTop:4,fontStyle:"italic"}}>"{t.apelido}"</div>}
          </div>
          <div style={{display:"flex",gap:8,paddingTop:8}}>
            <Btn variant="outline" sm onClick={onEdit}>✏ Editar</Btn>
            <Btn variant="danger" sm onClick={()=>{if(window.confirm(`Deletar temporada ${t.ano}?`))onDelete();}}>Deletar</Btn>
            <Btn variant="ghost" sm onClick={onBack}>← Voltar</Btn>
          </div>
        </div>
        <Divider/>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid var(--line)",marginBottom:20,overflowX:"auto"}}>
        {ABAS.map(a=>(
          <button key={a.k} onClick={()=>setAba(a.k)} style={{background:"none",padding:"8px 18px",fontSize:12,fontWeight:500,whiteSpace:"nowrap",color:aba===a.k?"var(--gold)":"var(--muted)",borderBottom:`2px solid ${aba===a.k?"var(--gold)":"transparent"}`}}>{a.l}</button>
        ))}
      </div>

      {aba==="resumo" && (
        <div>
          {Object.keys(campeoes).length>0&&(
            <div style={{marginBottom:24}}>
              <Label>Campeões de Liga</Label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginTop:8}}>
                {Object.entries(campeoes).map(([liga,clube])=>(
                  <div key={liga} style={{border:"1px solid var(--line2)",padding:"12px 16px",background:"var(--bg2)"}}>
                    <div className="mono" style={{fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>{liga}</div>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--gold2)"}}>{clube}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {t.copas.length>0&&(
            <div style={{marginBottom:24}}>
              <Label>Campeões de Copa</Label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginTop:8}}>
                {t.copas.map(c=>(
                  <div key={c.id} style={{border:"1px solid var(--line2)",padding:"12px 16px",background:"var(--bg2)"}}>
                    <div className="mono" style={{fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>{c.comp}</div>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--gold2)"}}>{c.campeao}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
            {t.artilheiros.length>0&&(()=>{
              const top=[...t.artilheiros].sort((a,b)=>b.gols-a.gols)[0];
              return <div style={{border:"1px solid var(--line2)",padding:"16px",background:"var(--bg2)"}}>
                <Label>Artilheiro</Label>
                <div style={{fontSize:18,fontWeight:700,marginTop:4}}>{top.nome}</div>
                <div style={{fontSize:12,color:"var(--muted2)"}}>{top.clube} · {top.comp}</div>
                <div className="mono" style={{fontSize:24,color:"var(--green)",fontWeight:500,marginTop:8}}>{top.gols} <span style={{fontSize:12}}>gols</span></div>
              </div>;
            })()}
            {t.assistentes.length>0&&(()=>{
              const top=[...t.assistentes].sort((a,b)=>b.n-a.n)[0];
              return <div style={{border:"1px solid var(--line2)",padding:"16px",background:"var(--bg2)"}}>
                <Label>Assistências</Label>
                <div style={{fontSize:18,fontWeight:700,marginTop:4}}>{top.nome}</div>
                <div style={{fontSize:12,color:"var(--muted2)"}}>{top.clube} · {top.comp}</div>
                <div className="mono" style={{fontSize:24,color:"var(--gold2)",fontWeight:500,marginTop:8}}>{top.n} <span style={{fontSize:12}}>assists.</span></div>
              </div>;
            })()}
          </div>
          {t.premios.length>0&&(
            <div style={{marginBottom:24}}>
              <Label>Prêmios Individuais</Label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginTop:8}}>
                {t.premios.map(p=>(
                  <div key={p.id} style={{border:"1px solid var(--line2)",padding:"12px 16px",background:"var(--bg2)"}}>
                    <Pill color="var(--gold)">{p.titulo}</Pill>
                    <div style={{fontWeight:600,fontSize:14,marginTop:8}}>{p.nome}</div>
                    <div style={{fontSize:11,color:"var(--muted2)",marginTop:2}}>{p.clube}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {t.notas&&<Panel><PanelHead>Notas</PanelHead><div style={{padding:"14px 16px",fontSize:13,color:"var(--muted2)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{t.notas}</div></Panel>}
        </div>
      )}

      {aba==="tabelas" && (
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {ligasComDados.map(l=>(
              <button key={l} onClick={()=>setLV(l)} style={{background:ligaVer===l?"var(--gold)":"transparent",color:ligaVer===l?"#111":"var(--muted)",border:`1px solid ${ligaVer===l?"var(--gold)":"var(--line2)"}`,padding:"5px 14px",fontSize:12,fontWeight:ligaVer===l?600:400}}>{l}</button>
            ))}
          </div>
          {ligaVer&&<Panel>
            <PanelHead>{ligaVer} — {t.ano}</PanelHead>
            <table>
              <thead><tr><th>#</th><th>Clube</th><th>Pts</th></tr></thead>
              <tbody>
                {[...(t.ligas[ligaVer]||[])].sort((a,b)=>b.pts-a.pts).map((r,i)=>(
                  <tr key={r.id} style={i===0?{background:"rgba(201,168,76,.06)"}:{}}>
                    <td className="mono" style={{fontSize:11,color:i===0?"var(--gold)":i<4?"var(--green)":i>=(t.ligas[ligaVer].length-3)?"var(--red)":"var(--muted)",fontWeight:600}}>{i+1}</td>
                    <td style={{fontWeight:i===0?700:400,color:i===0?"var(--gold2)":"var(--text)"}}>{r.clube}</td>
                    <td className="mono" style={{fontWeight:600,color:"var(--gold2)"}}>{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>}
        </div>
      )}

      {aba==="stats" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Panel>
            <PanelHead>Artilheiros</PanelHead>
            <table>
              <thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>G</th></tr></thead>
              <tbody>
                {[...t.artilheiros].sort((a,b)=>b.gols-a.gols).map((a,i)=>(
                  <tr key={a.id}><td className="mono" style={{fontSize:11,color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:500}}>{a.nome}</td><td style={{color:"var(--muted2)",fontSize:11}}>{a.clube}</td><td className="mono" style={{color:"var(--green)",fontWeight:500}}>{a.gols}</td></tr>
                ))}
                {!t.artilheiros.length&&<tr><td colSpan={4} style={{color:"var(--muted)",textAlign:"center",padding:"20px"}}>—</td></tr>}
              </tbody>
            </table>
          </Panel>
          <Panel>
            <PanelHead>Assistências</PanelHead>
            <table>
              <thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>A</th></tr></thead>
              <tbody>
                {[...t.assistentes].sort((a,b)=>b.n-a.n).map((a,i)=>(
                  <tr key={a.id}><td className="mono" style={{fontSize:11,color:"var(--muted)"}}>{i+1}</td><td style={{fontWeight:500}}>{a.nome}</td><td style={{color:"var(--muted2)",fontSize:11}}>{a.clube}</td><td className="mono" style={{color:"var(--gold2)",fontWeight:500}}>{a.n}</td></tr>
                ))}
                {!t.assistentes.length&&<tr><td colSpan={4} style={{color:"var(--muted)",textAlign:"center",padding:"20px"}}>—</td></tr>}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {aba==="selecao" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
          {["GOL","ZAG","LAT","VOL","MEI","ATA"].flatMap(pos=>t.selecao.filter(s=>s.pos===pos)).map(s=>(
            <div key={s.id} style={{border:"1px solid var(--line2)",padding:"14px",background:"var(--bg2)"}}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:posCol[s.pos]||"var(--gold)",letterSpacing:1,marginBottom:6}}>{s.pos}</div>
              <div style={{fontWeight:700,fontSize:14}}>{s.nome}</div>
              <div style={{fontSize:11,color:"var(--muted2)",marginTop:2}}>{s.clube}</div>
            </div>
          ))}
        </div>
      )}

      {aba==="copas" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
          {t.copas.map(c=>(
            <Panel key={c.id}>
              <PanelHead>{c.comp}</PanelHead>
              <div style={{padding:"14px 16px"}}>
                <div className="playfair" style={{fontSize:20,fontWeight:700,color:"var(--gold2)",marginBottom:4}}>{c.campeao}</div>
                {c.vice&&<div style={{fontSize:12,color:"var(--muted)"}}>Vice: {c.vice}</div>}
                {(c.artilheiro||c.mvp)&&<Divider style={{margin:"10px 0"}}/>}
                {c.artilheiro&&<div style={{fontSize:12,color:"var(--muted2)"}}>⚽ {c.artilheiro} — {c.gols} gols</div>}
                {c.mvp&&<div style={{fontSize:12,color:"var(--muted2)",marginTop:4}}>★ MVP: {c.mvp}</div>}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {aba==="notas"&&t.notas&&<Panel><PanelHead>Notas</PanelHead><div style={{padding:"20px",fontSize:13,color:"var(--muted2)",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{t.notas}</div></Panel>}
    </div>
  );
}

/* ── HISTÓRICO ── */
function Historico({temporadas}) {
  const mapa = useMemo(()=>{
    const m={};
    temporadas.forEach(t=>{
      Object.keys(t.ligas).forEach(comp=>{
        const rows=t.ligas[comp]||[];
        if(!rows.length) return;
        const top=[...rows].sort((a,b)=>b.pts-a.pts)[0];
        if(!top) return;
        if(!m[comp]) m[comp]=[];
        m[comp].push({ano:t.ano,clube:top.clube});
      });
      t.copas.forEach(c=>{
        if(!c.comp||!c.campeao) return;
        if(!m[c.comp]) m[c.comp]=[];
        m[c.comp].push({ano:t.ano,clube:c.campeao});
      });
    });
    Object.keys(m).forEach(k=>m[k].sort((a,b)=>+a.ano - +b.ano));
    return m;
  },[temporadas]);

  const comps=Object.keys(mapa).sort();

  if(!comps.length) return <div style={{textAlign:"center",padding:"60px 20px",color:"var(--muted)"}}>Registre temporadas para ver o histórico de títulos aqui.</div>;

  const ranking = useMemo(()=>{
    const r={};
    Object.values(mapa).flat().forEach(({clube})=>{r[clube]=(r[clube]||0)+1;});
    return Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,20);
  },[mapa]);

  return (
    <div>
      <Panel style={{marginBottom:24}}>
        <PanelHead>Clubes mais campeões</PanelHead>
        <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
          {ranking.map(([clube,n],i)=>(
            <div key={clube} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"var(--bg3)",border:"1px solid var(--line)"}}>
              <div><span className="mono" style={{fontSize:9,color:"var(--muted)",marginRight:6}}>{i+1}.</span><span style={{fontSize:13,fontWeight:500}}>{clube}</span></div>
              <span className="mono" style={{color:"var(--gold)",fontWeight:700,fontSize:14}}>{n}</span>
            </div>
          ))}
        </div>
      </Panel>
      {comps.map(comp=>(
        <Panel key={comp} style={{marginBottom:16}}>
          <PanelHead>{comp} <span className="mono" style={{fontSize:9,color:"var(--muted)"}}>{mapa[comp].length} edição(ões)</span></PanelHead>
          <table>
            <thead><tr><th>Ano</th><th>Campeão</th></tr></thead>
            <tbody>
              {mapa[comp].map((r,i)=>(
                <tr key={i}><td className="mono" style={{color:"var(--muted)",fontWeight:500,width:80}}>{r.ano}</td><td style={{fontWeight:500,color:"var(--gold2)"}}>{r.clube}</td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ))}
    </div>
  );
}

/* ── APP PRINCIPAL ── */
function App() {
  const [temporadas, setTemp] = useState([]);
  const [view, setView]       = useState("home");
  const [ativa, setAtiva]     = useState(null);
  const [busca, setBusca]     = useState("");

  const todasComps = useMemo(()=>[
    ...new Set([...COMPETICOES_PADRAO,...temporadas.flatMap(t=>[...Object.keys(t.ligas),...t.copas.map(c=>c.comp)])])
  ],[temporadas]);

  const salvar = (dados) => {
    setTemp(prev=>{
      const idx=prev.findIndex(t=>t.id===dados.id);
      const nova=idx>=0?prev.map((t,i)=>i===idx?dados:t):[dados,...prev];
      return nova.sort((a,b)=>+b.ano - +a.ano);
    });
    setAtiva(dados.id);
    setView("ver");
  };

  const deletar = (id) => { setTemp(prev=>prev.filter(t=>t.id!==id)); setView("home"); };
  const ativaObj = temporadas.find(t=>t.id===ativa);
  const filtradas = temporadas.filter(t=>!busca||t.ano.includes(busca)||(t.apelido||"").toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>

      <header style={{borderBottom:"1px solid var(--line)",padding:"0 28px",display:"flex",alignItems:"stretch",justifyContent:"space-between",background:"var(--bg)"}}>
        <div style={{display:"flex",alignItems:"center",gap:32}}>
          <div>
            <span className="playfair" style={{fontSize:18,fontWeight:900,color:"var(--gold)",letterSpacing:1}}>ALMANAQUE</span>
            <span className="mono" style={{fontSize:9,color:"var(--muted)",marginLeft:8,letterSpacing:2}}>FUTEBOL</span>
          </div>
          <nav style={{display:"flex"}}>
            {[{k:"home",l:"Temporadas"},{k:"historico",l:"Histórico de Títulos"}].map(n=>(
              <button key={n.k} onClick={()=>setView(n.k)} style={{background:"none",padding:"16px",fontSize:12,fontWeight:500,color:view===n.k?"var(--gold)":"var(--muted)",borderBottom:`2px solid ${view===n.k?"var(--gold)":"transparent"}`}}>{n.l}</button>
            ))}
          </nav>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span className="mono" style={{fontSize:10,color:"var(--muted)"}}>{temporadas.length} temporada(s)</span>
          {view!=="nova"&&<Btn sm onClick={()=>{setAtiva(null);setView("nova");}}>+ Nova temporada</Btn>}
        </div>
      </header>

      <main style={{padding:"28px",maxWidth:1000,margin:"0 auto"}}>

        {view==="home"&&(
          <div className="fade">
            {!temporadas.length?(
              <div style={{textAlign:"center",padding:"100px 20px"}}>
                <div className="playfair" style={{fontSize:28,color:"var(--muted)",marginBottom:12,fontWeight:700}}>Nenhuma temporada</div>
                <div style={{color:"var(--muted)",marginBottom:28,fontSize:13}}>Comece registrando a primeira temporada histórica.</div>
                <Btn onClick={()=>setView("nova")} style={{padding:"11px 32px",fontSize:14}}>+ Registrar temporada</Btn>
              </div>
            ):(
              <>
                <div style={{marginBottom:20}}><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por ano ou nome..." style={{maxWidth:300}}/></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
                  {filtradas.map(t=>{
                    const ligasN=Object.keys(t.ligas).filter(l=>(t.ligas[l]||[]).length>0).length;
                    return (
                      <div key={t.id} onClick={()=>{setAtiva(t.id);setView("ver");}} style={{border:"1px solid var(--line)",padding:"18px 20px",background:"var(--bg2)",cursor:"pointer",transition:"border-color .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}>
                        <div className="playfair" style={{fontSize:32,fontWeight:900,color:"var(--gold)",lineHeight:1}}>{t.ano}</div>
                        {t.apelido&&<div style={{fontSize:11,color:"var(--muted2)",marginTop:4,fontStyle:"italic",marginBottom:8}}>"{t.apelido}"</div>}
                        <Divider style={{margin:"10px 0"}}/>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                          {ligasN>0&&<Pill>{ligasN} liga(s)</Pill>}
                          {t.copas.length>0&&<Pill color="var(--muted2)">{t.copas.length} copa(s)</Pill>}
                          {t.selecao.length>0&&<Pill color="var(--green)">{t.selecao.length} seleção</Pill>}
                        </div>
                      </div>
                    );
                  })}
                  <div onClick={()=>setView("nova")} style={{border:"1px dashed var(--line)",padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",minHeight:120,color:"var(--muted)",transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--line)";e.currentTarget.style.color="var(--muted)";}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:24,marginBottom:4}}>+</div>
                      <div style={{fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>Nova temporada</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {(view==="nova"||view==="editar")&&(
          <FormTemporada inicial={view==="editar"?ativaObj:null} todasComps={todasComps} onSave={salvar} onCancel={()=>setView(ativaObj?"ver":"home")}/>
        )}

        {view==="ver"&&ativaObj&&(
          <VerTemporada t={ativaObj} onEdit={()=>setView("editar")} onDelete={()=>deletar(ativa)} onBack={()=>setView("home")}/>
        )}

        {view==="historico"&&(
          <div className="fade">
            <div style={{marginBottom:24}}>
              <div className="playfair" style={{fontSize:32,fontWeight:900,color:"var(--gold)"}}>Histórico de Títulos</div>
              <div style={{color:"var(--muted)",fontSize:13,marginTop:4}}>Compilado automático de todas as temporadas registradas.</div>
            </div>
            <Historico temporadas={temporadas}/>
          </div>
        )}

      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
