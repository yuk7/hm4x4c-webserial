let port;
let inputChCnt = 4;
let outputChCnt = 4;

async function onClickConnect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open(
            {
                baudRate: 115200,
                dataBits: 8,
                parity: "none",
                stopBits: 1
            }
        );
    } catch (error) {
        alert('Error: ' + error);
    }
}

async function onClickDisconnect() {
    try {
        await port.close();
    } catch (error) {
        alert('Error: ' + error);
    }
}

async function sendChUpDownCommand(outputCh, isUp) {
    if (outputCh < 0 || outputCh >= outputChCnt) {
        alert('Invalid channel number');
        return;
    }

    let startLocation = Math.floor(outputCh * (inputChCnt + 4)) - 3;
    var commandLocation = startLocation;
    if (isUp) {
        commandLocation = startLocation + 1;
    }

    if (commandLocation < 0) {
        commandLocation = outputChCnt * (inputChCnt + 4) + commandLocation;
    }

    let commandStr = 'cir ' + ('0' + (Number(commandLocation).toString(16))).slice(-2) + '\r\n';

    try {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(commandStr));
        writer.releaseLock();
    } catch (error) {
        alert('Error: ' + error);
    }
}

async function sendChCommand(inputCh, outputCh) {
    if (inputCh < 0 || inputCh >= inputChCnt || outputCh < 0 || outputCh >= outputChCnt) {
        alert('Invalid channel number');
        return;
    }
    let startLocation = Math.floor(outputCh * (inputChCnt + 4));
    let commandLocation = startLocation + inputCh;
    let commandStr = 'cir ' + ('0' + (Number(commandLocation).toString(16))).slice(-2) + '\r\n';

    try {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(commandStr));
        writer.releaseLock();
    } catch (error) {
        alert('Error: ' + error);
    }
}

window.addEventListener('load', function () {
    let controllerTable = document.getElementById('controller-table-area');
    let table = document.createElement('table');
    let tbody = document.createElement('tbody');

    let inputLabelsTr = document.createElement('tr');
    inputLabelsTr.appendChild(document.createElement('th'));
    let inLabel = document.createElement('th');
    inLabel.textContent = 'In';
    inputLabelsTr.appendChild(inLabel);
    for (let i = 0; i < inputChCnt; i++) {
        let th = document.createElement('th');
        th.textContent = i + 1;
        inputLabelsTr.appendChild(th);
    }
    let upLabel = document.createElement('th');
    upLabel.textContent = '+';
    inputLabelsTr.appendChild(upLabel);
    let downLabel = document.createElement('th');
    downLabel.textContent = '-';
    inputLabelsTr.appendChild(downLabel);

    tbody.appendChild(inputLabelsTr);

    let outputLabelsTr = document.createElement('tr');
    let outLabel = document.createElement('th');
    outLabel.textContent = 'Out';
    outputLabelsTr.appendChild(outLabel);
    tbody.appendChild(outputLabelsTr);

    for (let outCount = 0; outCount < outputChCnt; outCount++) {
        let tr = document.createElement('tr');
        let outChannelLabel = document.createElement('th');
        outChannelLabel.textContent = outCount + 1;
        tr.appendChild(outChannelLabel);
        tr.appendChild(document.createElement('th'));
        for (let inCount = 0; inCount < inputChCnt; inCount++) {
            let th = document.createElement('th');
            let button = document.createElement('input');
            button.type = 'button';
            button.value = (inCount + 1) + '->' + (outCount + 1);
            button.onclick = (function (_inCount, _outCount) {
                return function () {
                    sendChCommand(_inCount, _outCount);
                };
            })(inCount, outCount);
            th.appendChild(button);
            tr.appendChild(th);
        }

        let upButton = document.createElement('th');
        let upButtonEl = document.createElement('input');
        upButtonEl.type = 'button';
        upButtonEl.value = '+';
        upButtonEl.onclick = (function (_outCount) {
            return function () {
                sendChUpDownCommand(_outCount, true);
            };
        })(outCount);
        upButton.appendChild(upButtonEl);
        tr.appendChild(upButton);

        let downButton = document.createElement('th');
        let downButtonEl = document.createElement('input');
        downButtonEl.type = 'button';
        downButtonEl.value = '-';
        downButtonEl.onclick = (function (_outCount) {
            return function () {
                sendChUpDownCommand(_outCount, false);
            };
        })(outCount);
        downButton.appendChild(downButtonEl);
        tr.appendChild(downButton);

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    controllerTable.appendChild(table);
});