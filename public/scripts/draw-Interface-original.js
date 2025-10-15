export const colors = {
    background: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    uiBorder: "#0077ff",
    uiHeaderText: "#00aaff",
    uiDataPanel: "rgba(0, 68, 136, 0)",
    uiStatusText: "#00aaff",
    uiValueText: "#00ffaa",
    uiTimeIndicator: "#0077ff",
    alienGreen: "#00ff66",
    alienAmber: "#ffaa00",
    alienWarning: "#ff3300",
    alienBlinking: "#ffffff",
    alienDarkGreen: "#003322",
    alienChartGrid: "#007744",
    alienWaveform: "#00ff88",
    alienDotPattern: "rgba(0, 0, 0, 0.4)",
    earthOutline: "#00aaff",
    earthGrid: "#0077aa",
    gridLines: "#0055aa",
    orbitPrimary: "#00aaff",
    orbitSecondary: "#00ddff",
    orbitTertiary: "#0088cc",
    orbitAlternate: "#00ccff",
    satellitePrimary: "#ffffff",
    satelliteSecondary: "#ffaa00",
    satelliteTertiary: "#00ff88",
    satelliteAlternate: "#ffff00",
    targetBackground: "rgba(255, 255, 255, 0.25)",
    targetGlowInner: "rgba(255, 0, 0, 0.2)",
    targetGlowMiddle: "rgba(255, 0, 0, 0.2)",
    targetGlowOuter: "rgba(255, 0, 0, 0)",
    targetRingOuter: "rgba(0, 170, 255, 0.7)",
    targetRingMiddle: "rgba(255, 255, 255, 0.8)",
    targetRingInner: "rgba(255, 50, 50, 0.9)",
    targetCrosshair: "#ffffff",
    targetMeasurement: "#00ffaa",
    targetPulse: "rgba(255, 255, 255, 0.5)",
    targetGridLines: "rgba(0, 170, 255, 0.4)",
    targetText: "#00ffaa",
    sectionBorder: "#0066aa",
    sectionBorderLight: "#0088cc",
    sectionCorner: "#00aaff",
    panelBorder: "#004488",
};
export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    header: "bold 'Courier New', 'Courier', monospace",
    terminal: "'Courier New', 'Courier', monospace",
    display: "'Courier New', 'Courier', monospace",
};
export function drawInterface(canvas, ctx, scanParams, techParams, chromaticParams, systemData) {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = colors.uiBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = colors.uiHeaderText;
    ctx.font = `bold 18px ${fonts.header}`;
    ctx.fillText("APPROACH PARK ORBIT", 20, 35);
    // Draw right side data panel
    ctx.fillStyle = colors.uiDataPanel;
    ctx.fillRect(canvas.width - 150, 10, 140, canvas.height - 20);
    // Add border to right side panel
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 150, 10, 140, canvas.height - 20);
    // Draw bottom data panel for additional visualizations
    ctx.fillStyle = colors.uiDataPanel;
    ctx.fillRect(20, canvas.height - 140, canvas.width - 180, 120);
    // Add border to bottom panel
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, canvas.height - 140, canvas.width - 180, 120);
    const earthX = canvas.width / 2 - 80; // Centered in main area
    // Draw Earth in the center as a wireframe
    const earthY = canvas.height / 2 - 60;
    const earthRadius = 70;
    // Draw Earth outline
    ctx.strokeStyle = colors.earthOutline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 20, 0, Math.PI * 2);
    ctx.stroke();
    // Add latitude/longitude grid lines on Earth
    ctx.strokeStyle = colors.earthGrid;
    ctx.lineWidth = 0.5;
    // Latitude lines
    for (let i = -earthRadius; i <= earthRadius; i += 20) {
        const y = earthY + i;
        if (y >= earthY - earthRadius && y <= earthY + earthRadius) {
            const halfWidth = Math.sqrt(earthRadius * earthRadius - (y - earthY) * (y - earthY));
            ctx.beginPath();
            ctx.moveTo(earthX - halfWidth, y);
            ctx.lineTo(earthX + halfWidth, y);
            ctx.stroke();
        }
    }
    // Longitude lines
    for (let angle = 0; angle < Math.PI; angle += Math.PI / 6) {
        ctx.beginPath();
        ctx.ellipse(earthX, earthY, earthRadius * Math.abs(Math.cos(angle)), earthRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Dots where the grid lines intersect
    ctx.fillStyle = colors.earthGrid;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 2, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 360; i += 15) {
        const x = earthX + Math.cos(i * (Math.PI / 180)) * earthRadius;
        const y = earthY + Math.sin(i * (Math.PI / 180)) * earthRadius;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    // Draw orbital rings around Earth
    const timeNow = Date.now();
    const orbits = [
        {
            radiusX: earthRadius * 1.3,
            radiusY: earthRadius * 1.3 * 0.6,
            angle: Math.PI / 6,
            speed: 5000,
            color: colors.orbitPrimary,
            satelliteSize: 2,
            satelliteColor: colors.satellitePrimary,
            rotationAxis: "x", // Rotation around X axis
            rotationSpeed: 0.0005,
        },
        {
            radiusX: earthRadius * 1.6,
            radiusY: earthRadius * 1.6 * 0.5,
            angle: -Math.PI / 4,
            speed: 15000,
            color: colors.orbitSecondary,
            satelliteSize: 3,
            satelliteColor: colors.satelliteSecondary,
            rotationAxis: "y", // Rotation around Y axis
            rotationSpeed: 0.0007,
        },
        {
            radiusX: earthRadius * 1.9,
            radiusY: earthRadius * 1.9 * 0.7,
            angle: Math.PI / 3,
            speed: 18000,
            color: colors.orbitTertiary,
            satelliteSize: 2,
            satelliteColor: colors.satelliteTertiary,
            rotationAxis: "z", // Rotation around Z axis
            rotationSpeed: 0.0003,
        },
    ];
    orbits.forEach((orbit) => {
        // Save the current context to restore after rotation
        ctx.save();
        // Translate to earth center
        ctx.translate(earthX, earthY);
        // Calculate dynamic rotation based on time
        const dynamicRotation = timeNow * (orbit.rotationSpeed || 0);
        // Apply initial angle rotation
        ctx.rotate(orbit.angle);
        // Apply dynamic rotation based on axis
        if (orbit.rotationAxis === "x") {
            // Simulate X-axis rotation (squash and stretch the ellipse)
            const scaleY = 0.3 + Math.abs(Math.sin(dynamicRotation)) * 0.7;
            ctx.scale(1, scaleY);
        }
        else if (orbit.rotationAxis === "y") {
            // Simulate Y-axis rotation (squash and stretch the ellipse horizontally)
            const scaleX = 0.3 + Math.abs(Math.sin(dynamicRotation)) * 0.7;
            ctx.scale(scaleX, 1);
        }
        else if (orbit.rotationAxis === "z") {
            // Z-axis rotation is just regular rotation
            ctx.rotate(dynamicRotation);
        }
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.radiusX, orbit.radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        const satelliteAngle = ((timeNow % orbit.speed) / orbit.speed) * Math.PI * 2;
        const satelliteX = Math.cos(satelliteAngle) * orbit.radiusX;
        const satelliteY = Math.sin(satelliteAngle) * orbit.radiusY;
        ctx.fillStyle = orbit.satelliteColor;
        ctx.beginPath();
        ctx.arc(satelliteX, satelliteY, orbit.satelliteSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = orbit.satelliteColor;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(satelliteX, satelliteY);
        const trailAngle = satelliteAngle - 0.2;
        ctx.lineTo(Math.cos(trailAngle) * orbit.radiusX, Math.sin(trailAngle) * orbit.radiusY);
        ctx.stroke();
        ctx.restore();
    });
    const altOrbits = [
        {
            radiusX: earthRadius * 1.75,
            radiusY: earthRadius * 1.75 * 0.6,
            angle: Math.PI / 8,
            speed: 21000,
            color: colors.orbitAlternate,
            satelliteSize: 2,
            satelliteColor: colors.satelliteAlternate,
            rotationAxis: "yz",
            rotationSpeed: 0.0004,
        },
    ];
    altOrbits.forEach((orbit) => {
        ctx.save();
        ctx.translate(earthX, earthY);
        const dynamicRotation = timeNow * (orbit.rotationSpeed || 0);
        ctx.rotate(orbit.angle);
        if (orbit.rotationAxis === "xy") {
            const scaleX = 0.4 + Math.abs(Math.sin(dynamicRotation)) * 0.6;
            const scaleY = 0.4 + Math.abs(Math.cos(dynamicRotation)) * 0.6;
            ctx.scale(scaleX, scaleY);
            ctx.rotate(dynamicRotation * 0.2);
        }
        else if (orbit.rotationAxis === "yz") {
            const scaleY = 0.4 + Math.abs(Math.sin(dynamicRotation)) * 0.6;
            ctx.scale(1, scaleY);
            ctx.rotate(dynamicRotation * 0.3);
        }
        // Draw orbital path (dotted for variety)
        ctx.strokeStyle = orbit.color;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.radiusX, orbit.radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const satelliteAngle = ((timeNow % orbit.speed) / orbit.speed) * Math.PI * 2;
        const satelliteX = Math.cos(satelliteAngle) * orbit.radiusX;
        const satelliteY = Math.sin(satelliteAngle) * orbit.radiusY;
        // Draw triangular satellite for variety
        ctx.fillStyle = orbit.satelliteColor;
        ctx.beginPath();
        ctx.moveTo(satelliteX, satelliteY - orbit.satelliteSize * 1.5);
        ctx.lineTo(satelliteX + orbit.satelliteSize, satelliteY + orbit.satelliteSize);
        ctx.lineTo(satelliteX - orbit.satelliteSize, satelliteY + orbit.satelliteSize);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });
    if (scanParams.showGrid) {
        ctx.strokeStyle = colors.gridLines;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 8; i++) {
            const spacing = 40 + i * 15;
            // Horizontal perspective lines
            ctx.beginPath();
            ctx.moveTo(50, canvas.height / 2 - spacing);
            ctx.lineTo(canvas.width - 160, canvas.height / 2 - spacing);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(50, canvas.height / 2 + spacing);
            ctx.lineTo(canvas.width - 160, canvas.height / 2 + spacing);
            ctx.stroke();
            // Vertical perspective lines
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 60 - spacing, 60);
            ctx.lineTo(canvas.width / 2 - 60 - spacing, canvas.height - 60);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 60 + spacing, 60);
            ctx.lineTo(canvas.width / 2 - 60 + spacing, canvas.height - 60);
            ctx.stroke();
        }
        // Add diagonal perspective lines
        ctx.beginPath();
        ctx.moveTo(50, 60);
        ctx.lineTo(canvas.width - 160, canvas.height - 60);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 60);
        ctx.lineTo(canvas.width - 160, 60);
        ctx.stroke();
    }
    const targetSize = 120 * scanParams.targetSize;
    ctx.strokeStyle = colors.white;
    ctx.lineWidth = 2;
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(30, 60);
    ctx.lineTo(50, 60);
    ctx.moveTo(40, 50);
    ctx.lineTo(40, 70);
    ctx.stroke();
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(canvas.width - 170, 60);
    ctx.lineTo(canvas.width - 190, 60);
    ctx.moveTo(canvas.width - 180, 50);
    ctx.lineTo(canvas.width - 180, 70);
    ctx.stroke();
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(30, canvas.height - 60);
    ctx.lineTo(50, canvas.height - 60);
    ctx.moveTo(40, canvas.height - 50);
    ctx.lineTo(40, canvas.height - 70);
    ctx.stroke();
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(canvas.width - 170, canvas.height - 60);
    ctx.lineTo(canvas.width - 190, canvas.height - 60);
    ctx.moveTo(canvas.width - 180, canvas.height - 50);
    ctx.lineTo(canvas.width - 180, canvas.height - 70);
    ctx.stroke();
    const currentTime = Date.now();
    const blinkRate = Math.floor(currentTime / 500) % 2 === 0;
    const slowBlink = Math.floor(currentTime / 1200) % 2 === 0;
    if (!systemData || !systemData.lastUpdateTime) {
        systemData = generateSystemData(currentTime);
    }
    else {
        const timeSinceLastUpdate = currentTime - systemData.lastUpdateTime;
        if (timeSinceLastUpdate > 2000) {
            systemData = generateSystemData(currentTime);
        }
        else if (timeSinceLastUpdate > 500) {
            updateSystemDataSmooth(systemData, currentTime);
        }
    }
    const noiseValue1 = Math.floor(90 + Math.sin(currentTime / 2000) * 9);
    const noiseValue2 = Math.floor(120 + Math.cos(currentTime / 3000) * 20);
    const randomValue = Math.floor(700 + Math.sin(currentTime / 4000) * 299);
    // ----- RIGHT SIDE PANEL ELEMENTS -----
    // Draw section borders for right panel compartments
    drawSectionBorder(ctx, canvas.width - 145, 20, 130, 45); // Time section
    drawSectionBorder(ctx, canvas.width - 145, 65, 130, 70); // Vector section
    drawSectionBorder(ctx, canvas.width - 145, 135, 130, 95); // Attitude section
    drawSectionBorder(ctx, canvas.width - 145, 230, 130, 65); // Signal pattern
    drawSectionBorder(ctx, canvas.width - 145, 295, 130, 45); // Signal strength
    drawSectionBorder(ctx, canvas.width - 145, 340, 130, 55); // Life support
    drawSectionBorder(ctx, canvas.width - 145, 400, 130, 35); // Mother
    // Top section with time and basic info
    ctx.fillStyle = colors.white;
    ctx.font = `bold 12px ${fonts.primary}`;
    ctx.fillText("TIME SINCE 0", canvas.width - 140, 35);
    ctx.fillText("13:17:25:05", canvas.width - 140, 55);
    // Present vector section
    ctx.fillStyle = colors.uiValueText;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("PRESENT", canvas.width - 140, 85);
    ctx.fillText("VECTOR", canvas.width - 140, 100);
    ctx.fillStyle = colors.white;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText(`${Math.round(techParams.energyLevel).toString()}`, canvas.width - 140, 120);
    // Attitude correction section
    ctx.fillStyle = colors.uiValueText;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("ATTITUDE", canvas.width - 140, 150);
    ctx.fillText("CORRECTION", canvas.width - 140, 165);
    ctx.fillStyle = colors.white;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText(`X: ${(Math.round(targetSize * 10) / 100).toFixed(2)}`, canvas.width - 140, 185);
    ctx.fillText(`Y: ${(Math.round(scanParams.scanResolution * 100) / 10).toFixed(2)}`, canvas.width - 140, 205);
    ctx.fillText(`Z: ${(Math.round(techParams.insertionDepth * 10) / 10).toFixed(1)}`, canvas.width - 140, 225);
    // Signal waveform in side panel
    drawWaveform(ctx, canvas.width - 140, 250, 120, 40, systemData.noiseLevels);
    ctx.fillStyle = colors.alienAmber;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText("SIGNAL PATTERN", canvas.width - 140, 245);
    // Signal strength meter in side panel
    drawSignalMeter(ctx, canvas.width - 140, 320, 120, 15, systemData.signalStrength);
    ctx.fillStyle = colors.uiValueText;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText("SIGNAL STRENGTH", canvas.width - 140, 315);
    // Life Support system status
    ctx.fillStyle = colors.alienGreen;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("LIFE SUPPORT", canvas.width - 140, 365);
    if (systemData.lifeSupportStatus === "ALERT" || blinkRate) {
        ctx.fillStyle =
            systemData.lifeSupportStatus === "ALERT"
                ? colors.alienWarning
                : colors.alienAmber;
    }
    else {
        ctx.fillStyle = colors.alienGreen;
    }
    ctx.fillText(systemData.lifeSupportStatus, canvas.width - 140, 380);
    // Mother computer status - classic ALIEN reference
    ctx.fillStyle = colors.alienAmber;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("MOTHER", canvas.width - 140, 410);
    ctx.fillStyle = blinkRate ? colors.alienAmber : colors.white;
    ctx.fillText("PROCESSING...", canvas.width - 140, 425);
    // ----- BOTTOM PANEL ELEMENTS -----
    // Add label for bottom panel
    ctx.fillStyle = colors.uiHeaderText;
    ctx.font = `bold 11px ${fonts.header}`;
    ctx.fillText("SHIP DIAGNOSTICS PANEL", 20, canvas.height - 145);
    // Draw borders for each section in bottom panel
    drawSectionBorder(ctx, 22, canvas.height - 118, 186, 75); // System load
    drawSectionBorder(ctx, 225, canvas.height - 118, 205, 75); // Fuel cells
    drawSectionBorder(ctx, 445, canvas.height - 118, 210, 90); // Comms
    drawSectionBorder(ctx, 22, canvas.height - 55, 410, 30); // Status readings
    // Draw system load bar chart in bottom panel
    drawBarChart(ctx, 25, canvas.height - 110, 180, 40, systemData.systemLoad);
    ctx.fillStyle = colors.alienAmber;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText("SYSTEM LOAD", 20, canvas.height - 125);
    // Draw fuel cell
    const compactFuelCells = systemData.fuelCells.slice(0, 4);
    drawASCIIChart(ctx, 230, canvas.height - 110, compactFuelCells);
    ctx.fillStyle = colors.alienGreen;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText("FUEL CELLS", 230, canvas.height - 125);
    // Add scrolling text terminal in bottom panel
    drawScrollingText(ctx, 450, canvas.height - 110, 200, 80, currentTime);
    ctx.fillStyle = colors.alienAmber;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.fillText("COMMS DECRYPT", 450, canvas.height - 115);
    // Add oxygen level with changing values to bottom panel
    ctx.fillStyle = colors.alienGreen;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("O₂ LEVEL", 25, canvas.height - 50);
    ctx.fillStyle = noiseValue1 > 94 ? colors.white : colors.alienGreen;
    ctx.fillText(`${noiseValue1}%`, 90, canvas.height - 50);
    // Add Engine temp in bottom panel
    ctx.fillStyle = colors.alienGreen;
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillText("ENGINE TEMP", 150, canvas.height - 50);
    ctx.fillStyle = noiseValue2 > 130 ? colors.alienWarning : colors.alienGreen;
    ctx.fillText(`${noiseValue2}°C`, 235, canvas.height - 50);
    // Add radiation reading in bottom panel
    ctx.fillStyle = colors.alienAmber;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText("RAD", 300, canvas.height - 50);
    ctx.fillStyle = colors.white;
    ctx.fillText(`${randomValue}μSv/h`, 330, canvas.height - 50);
    // Alert status in bottom panel
    if (slowBlink) {
        ctx.fillStyle = colors.alienWarning;
        ctx.font = `12px ${fonts.primary}`;
        ctx.fillText("ALERT STATUS:", 450, canvas.height - 50);
        ctx.fillStyle = colors.alienBlinking;
        ctx.fillText("CAUTION", 540, canvas.height - 50);
    }
    // Add system status indicator like in the image
    ctx.font = `12px ${fonts.primary}`;
    ctx.fillStyle = colors.uiStatusText;
    ctx.fillText("SYSTEM STATUS", 20, canvas.height - 165);
    const statusText = scanParams.scanProgress > 0.5 ? "APPROACHING" : "ORBITAL";
    ctx.fillStyle = colors.uiValueText;
    ctx.fillText(statusText, 130, canvas.height - 165);
    // Add timestamp in corner
    const now = new Date();
    ctx.fillStyle = colors.uiTimeIndicator;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText(`${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`, canvas.width - 80, canvas.height - 145);
}
function generateSystemData(currentTime) {
    const systemLoad = Array(12)
        .fill(0)
        .map((_, i) => {
        const baseValue = 40 + 25 * Math.sin(currentTime / 15000 + i * 0.3);
        const noise = Math.sin(currentTime / 8000 + i * 2) * 2;
        return Math.floor(baseValue + noise);
    });
    const noiseLevels = Array(100)
        .fill(0)
        .map((_, i) => Math.sin(currentTime / 1000 + i * 0.2) * 12 +
        Math.sin(currentTime / 2000 + i * 0.1) * 8);
    const fuelCells = Array(8)
        .fill(0)
        .map((_, i) => Math.min(100, Math.max(0, 70 + Math.sin(currentTime / 10000 + i) * 30)));
    const lifeSupportStatus = Math.random() > 0.98 ? "ALERT" : "NOMINAL";
    return {
        systemLoad,
        signalStrength: 60 + Math.sin(currentTime / 4000) * 20,
        noiseLevels,
        fuelCells,
        lifeSupportStatus,
        lastUpdateTime: currentTime,
    };
}
function updateSystemDataSmooth(systemData, currentTime) {
    const updateCounter = Math.floor(currentTime / 1000) % 5;
    if (updateCounter === 0) {
        systemData.systemLoad = systemData.systemLoad.map((value, i) => {
            const adjustment = Math.sin(currentTime / 10000 + i * 0.5) * 1;
            return Math.min(100, Math.max(20, value + adjustment));
        });
    }
    systemData.noiseLevels = systemData.noiseLevels.map((value, i) => {
        const drift = Math.sin(currentTime / 1000 + i * 0.2) * 0.5;
        return value + drift;
    });
    systemData.signalStrength =
        systemData.signalStrength +
            (Math.sin(currentTime / 4000) -
                Math.sin(systemData.lastUpdateTime / 4000)) *
                5;
    systemData.signalStrength = Math.min(100, Math.max(20, systemData.signalStrength));
    systemData.lastUpdateTime = currentTime;
}
function drawSectionBorder(ctx, x, y, width, height) {
    ctx.strokeStyle = colors.sectionBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    const cornerSize = 6;
    ctx.strokeStyle = colors.sectionCorner;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + width - cornerSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerSize);
    ctx.stroke();
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(x, y + height - cornerSize);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + cornerSize, y + height);
    ctx.stroke();
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(x + width - cornerSize, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - cornerSize);
    ctx.stroke();
}
// Function to draw a waveform/oscilloscope display
function drawWaveform(ctx, x, y, width, height, data) {
    // Draw border around waveform
    ctx.strokeStyle = colors.sectionBorderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    // Draw background
    ctx.fillStyle = colors.alienDarkGreen;
    ctx.fillRect(x, y, width, height);
    // Draw grid lines
    ctx.strokeStyle = colors.alienChartGrid;
    ctx.lineWidth = 0.5;
    // Vertical grid lines
    for (let i = 0; i <= width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + height);
        ctx.stroke();
    }
    // Horizontal grid lines
    for (let i = 0; i <= height; i += 10) {
        ctx.beginPath();
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + width, y + i);
        ctx.stroke();
    }
    ctx.strokeStyle = colors.alienWaveform;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(x, y + height / 2);
    const pointSpacing = width / data.length;
    data.forEach((value, index) => {
        const yPos = y + height / 2 - value;
        if (index > 0 && index < data.length - 1) {
            const prevX = x + (index - 1) * pointSpacing;
            const prevY = y + height / 2 - data[index - 1];
            const currX = x + index * pointSpacing;
            const currY = yPos;
            const cpX = (prevX + currX) / 2;
            const cpY = (prevY + currY) / 2;
            ctx.quadraticCurveTo(cpX, cpY, currX, currY);
        }
        else {
            ctx.lineTo(x + index * pointSpacing, yPos);
        }
    });
    ctx.stroke();
}
function drawBarChart(ctx, x, y, width, height, data) {
    ctx.strokeStyle = colors.sectionBorderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = colors.alienDarkGreen;
    ctx.fillRect(x, y, width, height);
    const barWidth = Math.floor(width / data.length) - 1;
    data.forEach((value, index) => {
        const barHeight = (value / 100) * height;
        let barColor;
        if (value > 85) {
            barColor = colors.alienWarning;
        }
        else if (value > 65) {
            barColor = colors.alienAmber;
        }
        else {
            barColor = colors.alienGreen;
        }
        ctx.fillStyle = barColor;
        const barX = x + index * (barWidth + 1);
        const barY = y + height - barHeight;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        addDottedTexture(ctx, barX, barY, barWidth, barHeight);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(barX, barY, barWidth, 2);
    });
}
function drawASCIIChart(ctx, x, y, data) {
    const chartHeight = data.length * 12 + 5;
    ctx.strokeStyle = colors.sectionBorderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 5, y - 10, 200, chartHeight);
    ctx.fillStyle = colors.alienDarkGreen;
    ctx.fillRect(x - 5, y - 10, 200, chartHeight);
    addDottedTexture(ctx, x - 5, y - 10, 200, chartHeight, 0.2);
    ctx.font = `10px ${fonts.terminal}`;
    data.forEach((value, index) => {
        const blocks = Math.round((value / 100) * 10);
        let barText = "";
        for (let i = 0; i < 10; i++) {
            barText += i < blocks ? "█" : "░";
        }
        if (value < 30) {
            ctx.fillStyle = colors.alienWarning;
        }
        else if (value < 60) {
            ctx.fillStyle = colors.alienAmber;
        }
        else {
            ctx.fillStyle = colors.alienGreen;
        }
        ctx.fillText(`CELL ${index + 1}: ${barText} ${Math.round(value)}%`, x, y + index * 12);
    });
}
function drawSignalMeter(ctx, x, y, width, height, value) {
    ctx.strokeStyle = colors.sectionBorderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = colors.alienDarkGreen;
    ctx.fillRect(x, y, width, height);
    const fillWidth = (value / 100) * width;
    if (value < 30) {
        ctx.fillStyle = colors.alienWarning;
    }
    else if (value < 60) {
        ctx.fillStyle = colors.alienAmber;
    }
    else {
        ctx.fillStyle = colors.alienGreen;
    }
    ctx.fillRect(x, y, fillWidth, height);
    addDottedTexture(ctx, x, y, fillWidth, height);
    ctx.fillStyle = colors.white;
    ctx.font = `10px ${fonts.primary}`;
    ctx.fillText(`${Math.round(value)}%`, x + width - 30, y + height - 3);
}
function drawScrollingText(ctx, x, y, width, height, currentTime) {
    ctx.strokeStyle = colors.sectionBorderLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = colors.alienDarkGreen;
    ctx.fillRect(x, y, width, height);
    addDottedTexture(ctx, x, y, width, height, 0.2);
    const textLines = [
        "ANALYZING SIGNAL",
        "NO TRANSMISSION",
        "SCANNING SECTOR",
        "DATA CORRUPT",
        "RETRY COMMS LINK",
        "SIGNAL FADING",
        "NOISE DETECTED",
        "EMERGENCY BEACON",
        "UNKNOWN SOURCE",
    ];
    const timeOffset = Math.floor(currentTime / 3000) % textLines.length;
    const linesShown = 4;
    ctx.font = `8px ${fonts.terminal}`;
    for (let i = 0; i < linesShown; i++) {
        const lineIndex = (timeOffset + i) % textLines.length;
        const lineText = textLines[lineIndex];
        const randomChar = Math.random() > 0.85
            ? String.fromCharCode(Math.floor(Math.random() * 26) + 65)
            : "";
        if (i === 0 && Math.floor(currentTime / 800) % 2 === 0) {
            ctx.fillStyle = colors.alienAmber;
        }
        else {
            ctx.fillStyle = colors.alienGreen;
        }
        ctx.fillText(`>${lineText}${randomChar}`, x + 2, y + 10 + i * 10);
    }
}
function addDottedTexture(ctx, x, y, width, height, intensity = 0.4) {
    const originalComposite = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "source-atop";
    const dotSpacing = 1;
    const dotSize = 0.5;
    for (let dy = 0; dy < height; dy += dotSpacing) {
        const rowOffset = dy % (dotSpacing * 2) === 0 ? 0 : dotSpacing / 2;
        for (let dx = rowOffset; dx < width; dx += dotSpacing) {
            const dotOpacity = Math.random() * intensity;
            ctx.fillStyle = `rgba(0, 0, 0, ${dotOpacity})`;
            ctx.fillRect(x + dx, y + dy, dotSize, dotSize);
        }
    }
    ctx.globalCompositeOperation = originalComposite;
}
