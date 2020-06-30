export enum Categories {
    petClean = "Limpieza",
    petFood = "Alimentación",
    ocio = "Ocio",
    location = "Lugares de interés",
    curiosity = "Datos curiosos",
    tips = "Consejos"

}
export function getCategoriesImgs(){
    return ['/src/assets/icon/cleaning.png','/src/assets/icon/food.png',
     '/src/assets/icon/tennis.png', '/src/assets/icon/ubication-icon.png',
    '/src/assets/icon/curiosity.png', '/src/assets/icon/tips.png']
}
