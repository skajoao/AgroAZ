import { db } from "@/database/database";

import { useEffect } from "react";

export async function buscarTalhoes(){
    try{
        return await db.getAllAsync(`SELECT * FROM talhoes`)
    }catch(err){
        console.log("erro ao buscar talhoes", err)
    }
}
