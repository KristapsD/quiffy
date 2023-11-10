export const allEqual = (arr: (string | undefined)[]) => {
    return arr.every(val => val === arr[0]);
}

export const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

export const fiveConsecutive = (msg: string) => {
    let seperatedPyramid: string[] = msg.split(' ');
    seperatedPyramid = seperatedPyramid.filter((str) => { return /^\w+$/g.test(str); }); // just for safety

    return seperatedPyramid.length >= 5 && allEqual(seperatedPyramid)
}