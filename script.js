let rowCounter = 0;
let inventoryData = [];

// เริ่มต้นด้วยข้อมูลตัวอย่าง
window.onload = function() {
    initializeData();
};

// เพิ่มข้อมูลตัวอย่าง
function initializeData() {
    const sampleData = [
        {date: '2025-01-01', branch: 'A', type: 'รับเข้า', inQty: 100, inCost: 100, outQty: 0, prevQty: 0, prevCost: 0, note: 'รับเข้า'},
        {date: '2025-01-01', branch: 'B', type: 'รับเข้า', inQty: 50, inCost: 102, outQty: 0, prevQty: 0, prevCost: 0, note: 'รับเข้า'},
        {date: '2025-01-02', branch: 'A', type: 'ขาย', inQty: 0, inCost: 100, outQty: 60, prevQty: 100, prevCost: 100, note: 'ขาย'},
        {date: '2025-01-02', branch: 'B', type: 'ขาย', inQty: 0, inCost: 102, outQty: 30, prevQty: 50, prevCost: 102, note: 'ขาย'},
        {date: '2025-01-03', branch: 'B', type: 'รับเข้า', inQty: 50, inCost: 105, outQty: 0, prevQty: 20, prevCost: 102, note: 'รับเข้า'},
        {date: '2025-01-03', branch: 'A', type: 'รับเข้า', inQty: 80, inCost: 105, outQty: 0, prevQty: 40, prevCost: 100, note: 'รับเข้า'}
    ];

    inventoryData = [];
    sampleData.forEach(data => {
        addRowWithData(data);
    });
}

function addRow() {
    const date = document.getElementById('dateInput').value || '2025-01-01';
    const branch = document.getElementById('branchInput').value || 'A';
    
    addRowWithData({
        date: date,
        branch: branch,
        type: 'รับเข้า',
        inQty: 0,
        inCost: 100,
        outQty: 0,
        prevQty: 0,
        prevCost: 0,
        note: ''
    });
}

function addRowWithData(data) {
    const tableBody = document.getElementById('tableBody');
    const row = document.createElement('tr');
    row.id = `row-${rowCounter}`;
    
    // คำนวณค่าใหม่ - คงเหลือใหม่จะรวมจำนวนรับเข้าไว้แล้ว
    const newQty = (data.prevQty + data.inQty - data.outQty);
    let newAvgCost = 0;
    
    if (newQty > 0) {
        if (data.inQty > 0 && data.type === 'รับเข้า') {
            // มีสินค้าเข้าและเป็นประเภท "รับเข้า" - คำนวณต้นทุนเฉลี่ยใหม่
            newAvgCost = ((data.prevCost * data.prevQty) + (data.inCost * data.inQty)) / (data.prevQty + data.inQty);
        } else {
            // ไม่มีสินค้าเข้าหรือไม่ใช่ประเภท "รับเข้า" - ใช้ต้นทุนเฉลี่ยเดิม
            newAvgCost = data.prevCost;
        }
    }
    
    const totalValue = newQty * newAvgCost;
    
    row.innerHTML = `
        <td><input type="date" value="${data.date}" onchange="updateCalculations()"></td>
        <td><input type="text" value="${data.branch}" onchange="updateCalculations()"></td>
        <td>
            <select onchange="updateCalculations(); toggleFields(this)">
                <option value="รับเข้า" ${data.type === 'รับเข้า' ? 'selected' : ''}>รับเข้า</option>
                <option value="ขาย" ${data.type === 'ขาย' ? 'selected' : ''}>ขาย</option>
                <option value="ปรับสต๊อก" ${data.type === 'ปรับสต๊อก' ? 'selected' : ''}>ปรับสต๊อก</option>
            </select>
        </td>
        <td class="input-cell"><input type="number" value="${data.inQty}" min="0" onchange="updateCalculations()"></td>
        <td class="input-cell"><input type="number" value="${data.inCost}" min="0" step="0.01" onchange="updateCalculations()"></td>
        <td class="input-cell"><input type="number" value="${data.outQty}" min="0" onchange="updateCalculations()"></td>
        <td class="input-cell"><input type="number" value="${data.prevCost}" min="0" step="0.01" onchange="updateCalculations()" readonly style="background-color: #f0f0f0;"></td>
        <td class="calculated-cell">${newQty}</td>
        <td class="calculated-cell">${newAvgCost.toFixed(2)}</td>
        <td class="calculated-cell">${totalValue.toFixed(2)}</td>
        <td><input type="text" value="${data.note}" style="width: 80px;"></td>
        <td><button onclick="deleteRow('${row.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">ลบ</button></td>
    `;
    
    tableBody.appendChild(row);
    inventoryData.push({id: rowCounter, ...data});
    rowCounter++;
    
    // ปรับฟิลด์ให้เหมาะสมกับประเภท
    toggleFields(row.querySelector('select'));
    
    updateCalculations();
}

function deleteRow(rowId) {
    const row = document.getElementById(rowId);
    const index = parseInt(rowId.split('-')[1]);
    
    if (row) {
        row.remove();
        inventoryData = inventoryData.filter(item => item.id !== index);
        updateCalculations();
    }
}

// ฟังก์ชันสำหรับปรับฟิลด์ให้เหมาะสมกับประเภท
function toggleFields(selectElement) {
    const row = selectElement.closest('tr');
    const inputs = row.getElementsByTagName('input');
    const type = selectElement.value;
    
    // รีเซ็ตค่าทั้งหมดก่อน
    inputs[2].value = 0; // จำนวนรับเข้า
    inputs[4].value = 0; // จำนวนขาย
    
    if (type === 'รับเข้า') {
        // เปิดใช้งานฟิลด์รับเข้า
        inputs[2].disabled = false; // จำนวนรับเข้า
        inputs[3].disabled = false; // ต้นทุนรับเข้า
        inputs[4].disabled = true;  // จำนวนขาย
        inputs[2].style.backgroundColor = '';
        inputs[3].style.backgroundColor = '';
        inputs[4].style.backgroundColor = '#f0f0f0';
    } else if (type === 'ขาย') {
        // เปิดใช้งานฟิลด์ขาย
        inputs[2].disabled = true;  // จำนวนรับเข้า
        inputs[3].disabled = true;  // ต้นทุนรับเข้า
        inputs[4].disabled = false; // จำนวนขาย
        inputs[2].style.backgroundColor = '#f0f0f0';
        inputs[3].style.backgroundColor = '#f0f0f0';
        inputs[4].style.backgroundColor = '';
    } else if (type === 'ปรับสต๊อก') {
        // เปิดใช้งานทั้งสองฟิลด์ (สามารถเป็นบวกหรือลบได้)
        inputs[2].disabled = false; // จำนวนรับเข้า
        inputs[3].disabled = true;  // ต้นทุนรับเข้า (ไม่ใช้สำหรับปรับสต๊อก)
        inputs[4].disabled = false; // จำนวนขาย
        inputs[2].style.backgroundColor = '';
        inputs[3].style.backgroundColor = '#f0f0f0';
        inputs[4].style.backgroundColor = '';
    }
    
    updateCalculations();
}

function updateCalculations() {
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');
    const branchData = {}; // เก็บข้อมูลของแต่ละสาขา
    
    // คำนวณแต่ละแถวและจัดกลุ่มตามสาขา
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const inputs = row.getElementsByTagName('input');
        const select = row.getElementsByTagName('select')[0];
        
        const branch = inputs[1].value || 'A';
        const type = select.value;
        const inQty = parseFloat(inputs[2].value) || 0;
        const inCost = parseFloat(inputs[3].value) || 0;
        const outQty = parseFloat(inputs[4].value) || 0;
        
        // หาข้อมูลจากแถวก่อนหน้าของสาขาเดียวกัน (เฉพาะประเภท "รับเข้า")
        let prevQty = 0;
        let prevAvgCost = 0;
        
        // หาแถวก่อนหน้าทั้งหมดของสาขาเดียวกัน
        for (let j = i - 1; j >= 0; j--) {
            const prevRow = rows[j];
            const prevInputs = prevRow.getElementsByTagName('input');
            const prevSelect = prevRow.getElementsByTagName('select')[0];
            const prevBranch = prevInputs[1].value || 'A';
            
            if (prevBranch === branch) {
                // ใช้คงเหลือใหม่และต้นทุนเฉลี่ยใหม่จากแถวก่อนหน้า
                prevQty = parseFloat(prevRow.cells[7].textContent) || 0;
                prevAvgCost = parseFloat(prevRow.cells[8].textContent) || 0;
                break;
            }
        }
        
        // หาข้อมูลต้นทุนเฉลี่ยเดิมจากแถวประเภท "รับเข้า" ก่อนหน้าของสาขาเดียวกัน
        let previousReceivingAvgCost = 0;
        for (let j = i - 1; j >= 0; j--) {
            const prevRow = rows[j];
            const prevInputs = prevRow.getElementsByTagName('input');
            const prevSelect = prevRow.getElementsByTagName('select')[0];
            const prevBranch = prevInputs[1].value || 'A';
            const prevType = prevSelect.value;
            
            if (prevBranch === branch && prevType === 'รับเข้า') {
                // ใช้ต้นทุนเฉลี่ยใหม่จากแถว "รับเข้า" ก่อนหน้า
                previousReceivingAvgCost = parseFloat(prevRow.cells[8].textContent) || 0;
                break;
            }
        }
        
        // อัปเดตฟิลด์ "ต้นทุนเฉลี่ยเดิมของสาขา" ให้แสดงค่าจากแถว "รับเข้า" ก่อนหน้า
        inputs[5].value = previousReceivingAvgCost.toFixed(2);
        
        // คำนวณจำนวนคงเหลือใหม่
        const newQty = prevQty + inQty - outQty;
        
        // คำนวณต้นทุนเฉลี่ยใหม่ (เฉพาะกรณี "รับเข้า" เท่านั้น)
        let newAvgCost = prevAvgCost;
        if (newQty > 0) {
            if (inQty > 0 && type === 'รับเข้า') {
                // เฉพาะประเภท "รับเข้า" เท่านั้นที่จะคำนวณต้นทุนเฉลี่ยใหม่
                newAvgCost = ((prevAvgCost * prevQty) + (inCost * inQty)) / (prevQty + inQty);
            }
        }
        
        const currentValue = newQty * newAvgCost;
        
        // อัปเดตค่าในตาราง
        row.cells[7].textContent = newQty;
        row.cells[8].textContent = newAvgCost.toFixed(2);
        row.cells[9].textContent = currentValue.toFixed(2);
        
        // เก็บข้อมูลล่าสุดของแต่ละสาขา (แถวล่าสุดของแต่ละสาขา)
        if (newQty >= 0) { // รวมกรณีที่คงเหลือเป็น 0 ด้วย
            branchData[branch] = {
                quantity: newQty,
                avgCost: newAvgCost,
                value: currentValue,
                rowIndex: i
            };
        }
    }
    
    // คำนวณต้นทุนเฉลี่ย Master จากข้อมูลล่าสุดของแต่ละสาขา (เฉพาะที่มีสต๊อกเหลือ)
    let totalWeightedCost = 0;
    let totalQuantity = 0;
    let totalValue = 0;
    
    Object.values(branchData).forEach(branch => {
        if (branch.quantity > 0) { // เฉพาะสาขาที่มีสต๊อกเหลือ
            totalWeightedCost += branch.avgCost * branch.quantity;
            totalQuantity += branch.quantity;
            totalValue += branch.value;
        }
    });
    
    // คำนวณต้นทุนเฉลี่ย Master
    const masterAvgCost = totalQuantity > 0 ? totalWeightedCost / totalQuantity : 0;
    
    // อัปเดตสรุปข้อมูล
    document.getElementById('masterAvgCost').textContent = masterAvgCost.toFixed(2);
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
    
    // แสดงรายละเอียดแต่ละสาขา
    updateBranchSummary(branchData);
}

function exportToCSV() {
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');
    let csvContent = "วันที่,สาขา,ประเภท,จำนวนรับเข้า,ต้นทุนรับเข้า,จำนวนขาย,ต้นทุนเฉลี่ยเดิม,คงเหลือใหม่,ต้นทุนเฉลี่ยใหม่,มูลค่าคงเหลือ,หมายเหตุ\n";
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const inputs = row.getElementsByTagName('input');
        const select = row.getElementsByTagName('select')[0];
        const cells = row.getElementsByTagName('td');
        
        const rowData = [
            inputs[0].value, // วันที่
            inputs[1].value, // สาขา
            select.value, // ประเภท
            inputs[2].value, // จำนวนรับเข้า
            inputs[3].value, // ต้นทุนรับเข้า
            inputs[4].value, // จำนวนขาย
            inputs[5].value, // ต้นทุนเฉลี่ยเดิม
            cells[7].textContent, // คงเหลือใหม่
            cells[8].textContent, // ต้นทุนเฉลี่ยใหม่
            cells[9].textContent, // มูลค่าคงเหลือ
            inputs[6].value // หมายเหตุ
        ];
        
        csvContent += rowData.join(',') + '\n';
    }
    
    // เพิ่มข้อมูล Master
    csvContent += `\nสรุป Master:\n`;
    csvContent += `ต้นทุนเฉลี่ย Master,${document.getElementById('masterAvgCost').textContent}\n`;
    csvContent += `จำนวนรวม,${document.getElementById('totalQuantity').textContent}\n`;
    csvContent += `มูลค่ารวม,${document.getElementById('totalValue').textContent}\n`;
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_calculation_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAll() {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?')) {
        document.getElementById('tableBody').innerHTML = '';
        inventoryData = [];
        rowCounter = 0;
        updateCalculations();
    }
}

function updateBranchSummary(branchData) {
    const summaryDiv = document.getElementById('branchSummary');
    let summaryHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">';
    
    Object.entries(branchData).forEach(([branch, data]) => {
        summaryHTML += `
            <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 15px; border-radius: 8px; text-align: center;">
                <h5 style="margin: 0 0 10px 0; font-size: 1.2em;">สาขา ${branch}</h5>
                <div style="font-size: 0.9em; opacity: 0.9;">จำนวน: ${data.quantity}</div>
                <div style="font-size: 0.9em; opacity: 0.9;">ต้นทุนเฉลี่ย: ${data.avgCost.toFixed(2)}</div>
                <div style="font-size: 0.9em; opacity: 0.9;">มูลค่า: ${data.value.toFixed(2)}</div>
            </div>
        `;
    });
    
    summaryHTML += '</div>';
    
    if (Object.keys(branchData).length === 0) {
        summaryHTML = '<div style="text-align: center; color: #666; padding: 20px;">ยังไม่มีข้อมูลสาขา</div>';
    }
    
    summaryDiv.innerHTML = summaryHTML;
    
    // อัปเดตสูตรการคำนวณแบบละเอียด
    updateMasterFormula(branchData);
    updateBranchFormula();
}

function updateMasterFormula(branchData) {
    const formulaDiv = document.getElementById('masterFormula');
    
    // กรองเฉพาะสาขาที่มีสต๊อกเหลือ
    const activeBranches = Object.entries(branchData).filter(([branch, data]) => data.quantity > 0);
    
    if (activeBranches.length === 0) {
        formulaDiv.innerHTML = '<div style="text-align: center; opacity: 0.7;">ยังไม่มีข้อมูลการคำนวณ</div>';
        return;
    }
    
    // สร้างสูตรแบบละเอียด
    let numeratorParts = [];
    let denominatorParts = [];
    let totalWeightedCost = 0;
    let totalQuantity = 0;
    
    activeBranches.forEach(([branch, data]) => {
        const weightedCost = data.avgCost * data.quantity;
        numeratorParts.push(`(${data.avgCost.toFixed(2)} × ${data.quantity})`);
        denominatorParts.push(`${data.quantity}`);
        totalWeightedCost += weightedCost;
        totalQuantity += data.quantity;
    });
    
    const masterAvgCost = totalQuantity > 0 ? totalWeightedCost / totalQuantity : 0;
    
    let formulaHTML = `
        <div style="margin-bottom: 10px;"><strong>การคำนวณปัจจุบัน:</strong></div>
        <div style="margin-bottom: 8px;">
            ตัวเศษ: ${numeratorParts.join(' + ')} = ${totalWeightedCost.toFixed(2)}
        </div>
        <div style="margin-bottom: 8px;">
            ตัวส่วน: ${denominatorParts.join(' + ')} = ${totalQuantity}
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
            <strong>ผลลัพธ์: ${totalWeightedCost.toFixed(2)} ÷ ${totalQuantity} = ${masterAvgCost.toFixed(2)}</strong>
        </div>
    `;
    
    formulaDiv.innerHTML = formulaHTML;
}

function updateBranchFormula() {
    const formulaDiv = document.getElementById('branchFormula');
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');
    
    if (rows.length === 0) {
        formulaDiv.innerHTML = '<div style="text-align: center; opacity: 0.7;">ยังไม่มีข้อมูลการคำนวณ</div>';
        return;
    }
    
    let formulaHTML = '<div style="margin-bottom: 10px;"><strong>ตัวอย่างการคำนวณจากแถวล่าสุด:</strong></div>';
    
    // หาแถวรับเข้าล่าสุด
    let lastReceivingRow = null;
    let lastReceivingIndex = -1;
    
    for (let i = rows.length - 1; i >= 0; i--) {
        const row = rows[i];
        const select = row.getElementsByTagName('select')[0];
        if (select && select.value === 'รับเข้า') {
            lastReceivingRow = row;
            lastReceivingIndex = i;
            break;
        }
    }
    
    if (lastReceivingRow) {
        const inputs = lastReceivingRow.getElementsByTagName('input');
        const branch = inputs[1].value || 'A';
        const inQty = parseFloat(inputs[2].value) || 0;
        const inCost = parseFloat(inputs[3].value) || 0;
        const prevAvgCost = parseFloat(inputs[5].value) || 0;
        const newQty = parseFloat(lastReceivingRow.cells[7].textContent) || 0;
        const newAvgCost = parseFloat(lastReceivingRow.cells[8].textContent) || 0;
        
        // หาจำนวนเดิมจากแถวก่อนหน้า
        let prevQty = 0;
        for (let j = lastReceivingIndex - 1; j >= 0; j--) {
            const prevRow = rows[j];
            const prevInputs = prevRow.getElementsByTagName('input');
            const prevBranch = prevInputs[1].value || 'A';
            
            if (prevBranch === branch) {
                prevQty = parseFloat(prevRow.cells[7].textContent) || 0;
                break;
            }
        }
        
        const totalPrevValue = prevAvgCost * prevQty;
        const totalNewValue = inCost * inQty;
        const totalValue = totalPrevValue + totalNewValue;
        const totalQty = prevQty + inQty;
        
        formulaHTML += `
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                <div style="margin-bottom: 5px;"><strong>สาขา ${branch} - แถวที่ ${lastReceivingIndex + 1}</strong></div>
                <div style="font-size: 12px;">
                    ต้นทุนเฉลี่ยเดิม: ${prevAvgCost.toFixed(2)} | จำนวนเดิม: ${prevQty}<br>
                    ต้นทุนรับเข้า: ${inCost.toFixed(2)} | จำนวนรับเข้า: ${inQty}
                </div>
            </div>
            <div style="margin-bottom: 8px;">
                ตัวเศษ: (${prevAvgCost.toFixed(2)} × ${prevQty}) + (${inCost.toFixed(2)} × ${inQty}) = ${totalPrevValue.toFixed(2)} + ${totalNewValue.toFixed(2)} = ${totalValue.toFixed(2)}
            </div>
            <div style="margin-bottom: 8px;">
                ตัวส่วน: ${prevQty} + ${inQty} = ${totalQty}
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                <strong>ผลลัพธ์: ${totalValue.toFixed(2)} ÷ ${totalQty} = ${newAvgCost.toFixed(2)}</strong>
            </div>
        `;
    } else {
        formulaHTML += '<div style="text-align: center; opacity: 0.7;">ไม่พบการรับเข้าในข้อมูล</div>';
    }
    
    formulaDiv.innerHTML = formulaHTML;
}

// เพิ่มฟังก์ชันทดสอบตัวอย่างที่คุณให้
function testExample() {
    // ล้างข้อมูลเดิม
    document.getElementById('tableBody').innerHTML = '';
    inventoryData = [];
    rowCounter = 0;
    
    // เพิ่มข้อมูลตัวอย่างที่คุณให้
    addRowWithData({
        date: '2025-01-01',
        branch: 'A',
        type: 'รับเข้า',
        inQty: 100,
        inCost: 100,
        outQty: 0,
        prevQty: 0,
        prevCost: 0,
        note: 'รับเข้าครั้งที่ 1'
    });
    
    addRowWithData({
        date: '2025-01-02',
        branch: 'A',
        type: 'รับเข้า',
        inQty: 100,
        inCost: 102,
        outQty: 0,
        prevQty: 100,
        prevCost: 100,
        note: 'รับเข้าครั้งที่ 2'
    });
}
