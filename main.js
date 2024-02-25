let port;
const inputChCnt = 4;
const outputChCnt = 4;

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

function calculateCommandStartLocation(outputCh) {
    return outputCh * (inputChCnt + 4);
}

async function sendCommand(commandStr) {
    try {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(commandStr));
        writer.releaseLock();
    } catch (error) {
        alert('Error: ' + error);
    }
}

async function sendChUpDownCommand(outputCh, isUp) {
    if (outputCh < 0 || outputCh >= outputChCnt) {
        alert('Invalid channel number');
        return;
    }

    const startLocation = calculateCommandStartLocation(outputCh) - 3;

    let commandLocation = startLocation + (isUp ? 1 : 0);
    if (commandLocation < 0) {
        commandLocation += calculateCommandStartLocation(outputChCnt);
    }

    const commandStr = `cir ${('0' + (Number(commandLocation).toString(16))).slice(-2)}\r\n`
    await sendCommand(commandStr);
}

async function sendChCommand(inputCh, outputCh) {
    if (inputCh < 0 || inputCh >= inputChCnt || outputCh < 0 || outputCh >= outputChCnt) {
        alert('Invalid channel number');
        return;
    }
    const commandLocation = calculateCommandStartLocation(outputCh) + inputCh;
    const commandStr = `cir ${('0' + (Number(commandLocation).toString(16))).slice(-2)}\r\n`
    await sendCommand(commandStr);
}

window.addEventListener('load', function () {
    const controllerTable = document.getElementById('controller-table-area');
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    const inputLabelsTr = document.createElement('tr');
    inputLabelsTr.appendChild(document.createElement('th'));
    const inLabel = document.createElement('th');
    inLabel.textContent = 'In';
    inputLabelsTr.appendChild(inLabel);
    for (let i = 0; i < inputChCnt; i++) {
        const th = document.createElement('th');
        th.textContent = i + 1;
        inputLabelsTr.appendChild(th);
    }
    const upLabel = document.createElement('th');
    upLabel.textContent = '+';
    inputLabelsTr.appendChild(upLabel);
    const downLabel = document.createElement('th');
    downLabel.textContent = '-';
    inputLabelsTr.appendChild(downLabel);

    tbody.appendChild(inputLabelsTr);

    const outputLabelsTr = document.createElement('tr');
    const outLabel = document.createElement('th');
    outLabel.textContent = 'Out';
    outputLabelsTr.appendChild(outLabel);
    tbody.appendChild(outputLabelsTr);

    for (let outCount = 0; outCount < outputChCnt; outCount++) {
        const tr = document.createElement('tr');
        const outChannelLabel = document.createElement('th');
        outChannelLabel.textContent = outCount + 1;
        tr.appendChild(outChannelLabel);
        tr.appendChild(document.createElement('th'));
        for (let inCount = 0; inCount < inputChCnt; inCount++) {
            const th = document.createElement('th');
            const button = document.createElement('input');
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

        const upButton = document.createElement('th');
        const upButtonEl = document.createElement('input');
        upButtonEl.type = 'button';
        upButtonEl.value = '+';
        upButtonEl.onclick = (function (_outCount) {
            return function () {
                sendChUpDownCommand(_outCount, true);
            };
        })(outCount);
        upButton.appendChild(upButtonEl);
        tr.appendChild(upButton);

        const downButton = document.createElement('th');
        const downButtonEl = document.createElement('input');
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