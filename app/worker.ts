onmessage = ({data}: any) => {
    console.log(`Worker received '${data}'`);
    postMessage('From worker to master');
}
