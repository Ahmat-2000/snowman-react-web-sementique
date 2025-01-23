const prefix = 'http://www.kr2022.com/snowman#'

// transforme une URI en ID
// exemple : http://www.kr2022.com/snowman#cell45 -> 45
export function uriToId(uri){
    return uri.substring(prefix.length)
}