import Long from "long"

export interface DHRequest {
    pbk1: string 
    hmacPbk1: string
    g: string 
    p: string 
}
export interface DHResponse {
    pbk2: string 
    hmacPbk2: string
}