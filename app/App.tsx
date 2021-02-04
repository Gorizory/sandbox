import React, {
    PureComponent,
} from 'react';

import CustomWorker from 'worker-loader!./worker';

class App extends PureComponent {

    componentDidMount() {
        const worker = new CustomWorker();

        worker.onmessage = ({data}: any) => {
            console.log(`master received '${data}'`);
        }

        worker.postMessage('From master to worker');
    }

    render() {
        return (
            <div>
                <header>
                    Template app
                </header>
            </div>
        );
    }

}

export default App;
