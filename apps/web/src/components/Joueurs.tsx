function Joueur({nom, buts, passes}: {nom: string, buts: number, passes: number}) {

    return(<p className= "alert alert-primary display-4">
        {nom}: <strong>{buts}</strong> buts et <strong>{passes}</strong> passes
        </p>
);
}
export default Joueur;