export const colors = {
    background: "#040010",
    deepPurple: "#1a0033",
    neonPink: "#ff00cc",
    neonCyan: "#00e6ff",
    neonAmber: "#ffb347",
    neonGreen: "#5effa1",
    grid: "rgba(120, 0, 180, 0.3)",
    ringGlow: "rgba(255, 0, 204, 0.4)",
    panelBg: "rgba(20, 4, 40, 0.7)",
    panelLine: "rgba(255, 0, 204, 0.6)",
    filament: "rgba(0, 230, 255, 0.55)",
    ember: "rgba(255, 140, 102, 0.65)",
};

export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    terminal: "12px 'Courier New', 'Courier', monospace",
    label: "bold 11px 'Courier New', 'Courier', monospace",
};

export function drawInterface(
    canvas,
    ctx,
    scanParams,
    techParams,
    chromaticParams,
    systemData
) {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const timeNow = Date.now();

    drawForgeBackground(ctx, width, height, timeNow);
    drawHexGrid(ctx, width, height, timeNow);

    drawConcentricRings(ctx, centerX, centerY, timeNow, techParams);
    drawControlWidgets(ctx, centerX, centerY, timeNow, techParams, systemData);
    drawDataFilaments(ctx, centerX, centerY, timeNow, systemData, scanParams);
    drawCore(ctx, centerX, centerY, timeNow, scanParams, techParams);

    drawStatusBand(ctx, width, height, timeNow, systemData, scanParams, techParams);
}

function drawForgeBackground(ctx, width, height, time) {
    const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
    );
    gradient.addColorStop(0, "#0a0018");
    gradient.addColorStop(0.4, colors.deepPurple);
    gradient.addColorStop(1, colors.background);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const noiseCount = 160;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    for (let i = 0; i < noiseCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const alpha = 0.2 + 0.8 * Math.sin(time / 900 + x * 0.03 + y * 0.02);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.5, y + 0.5);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawHexGrid(ctx, width, height, time) {
    const size = 30;
    const rows = Math.ceil(height / size) + 2;
    const cols = Math.ceil(width / size) + 2;
    const offset = (time / 1500) % size;

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
            const x = c * size + (r % 2 === 0 ? 0 : size / 2) - offset;
            const y = r * (size * 0.866) - offset;
            drawHexagon(ctx, x, y, size * 0.5);
        }
    }
}

function drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + (Math.PI / 3) * i;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function drawConcentricRings(ctx, x, y, time, techParams) {
    const rings = [
        { radius: 220, thickness: 12, pulse: 0.2 },
        { radius: 160, thickness: 10, pulse: 0.35 },
        { radius: 110, thickness: 8, pulse: 0.5 },
    ];

    rings.forEach((ring, idx) => {
        const modulation = Math.sin(time / 800 + idx) * ring.pulse + 1;
        ctx.strokeStyle = colors.ringGlow;
        ctx.lineWidth = ring.thickness;
        ctx.beginPath();
        ctx.arc(x, y, ring.radius + modulation * 8, 0, Math.PI * 2);
        ctx.stroke();

        const dashedRadius = ring.radius - 10;
        ctx.save();
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = `rgba(0, 230, 255, ${0.25 + idx * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, dashedRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });

    const orbiters = techParams?.forgeOrbiters ?? 6;
    for (let i = 0; i < orbiters; i++) {
        const angle = (time / 1800 + i / orbiters) * Math.PI * 2;
        const radius = 160 + Math.sin(time / 1400 + i) * 18;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        ctx.fillStyle = colors.neonCyan;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawControlWidgets(ctx, x, y, time, techParams, systemData) {
    drawSliderRail(ctx, x, y, time, techParams);
    drawToggleArray(ctx, x, y, time, techParams);
    drawJoystickCluster(ctx, x, y, time, techParams);
    drawResourceBands(ctx, x, y, time, systemData);
}

function drawSliderRail(ctx, x, y, time, techParams) {
    const outerRadius = 240;
    const sliderCount = 8;
    const allocations = techParams?.resourceAllocation ?? new Array(sliderCount).fill(0.5);

    for (let i = 0; i < sliderCount; i++) {
        const angle = (Math.PI * 2 * i) / sliderCount - Math.PI / 2;
        const startX = x + Math.cos(angle) * (outerRadius - 30);
        const startY = y + Math.sin(angle) * (outerRadius - 30);
        const endX = x + Math.cos(angle) * (outerRadius - 80);
        const endY = y + Math.sin(angle) * (outerRadius - 80);

        ctx.strokeStyle = colors.neonCyan;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const position = allocations[i] ?? 0.5;
        const knobX = startX + (endX - startX) * position;
        const knobY = startY + (endY - startY) * position;
        const pulse = 4 + Math.sin(time / 200 + i) * 1.4;

        ctx.fillStyle = colors.neonPink;
        ctx.beginPath();
        ctx.arc(knobX, knobY, pulse, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawToggleArray(ctx, x, y, time, techParams) {
    const toggles = techParams?.forgeToggles ?? [0.2, 0.5, 0.8, 0.6, 0.3, 0.9];
    const radius = 130;

    toggles.forEach((state, idx) => {
        const angle = (Math.PI * 2 * idx) / toggles.length + Math.sin(time / 2000) * 0.05;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + state * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.neonAmber;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.neonAmber;
        ctx.font = fonts.label;
        ctx.fillText(`${Math.round(state * 100)}%`, px - 18, py + 4);
    });
}

function drawJoystickCluster(ctx, x, y, time, techParams) {
    const clusterRadius = 70;
    const joysticks = techParams?.joystickVectors ?? [
        { x: 0.2, y: 0.6 },
        { x: -0.4, y: 0.3 },
        { x: 0.1, y: -0.5 },
    ];

    ctx.strokeStyle = colors.neonCyan;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(x, y, clusterRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    joysticks.forEach((vector, idx) => {
        const vx = vector.x ?? 0;
        const vy = vector.y ?? 0;
        const angle = Math.atan2(vy, vx);
        const magnitude = Math.min(Math.hypot(vx, vy), 1);

        const baseAngle = angle + Math.sin(time / 1200 + idx) * 0.1;
        const tipRadius = clusterRadius * magnitude;
        const tipX = x + Math.cos(baseAngle) * tipRadius;
        const tipY = y + Math.sin(baseAngle) * tipRadius;

        ctx.strokeStyle = colors.neonGreen;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = colors.neonGreen;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 6 + Math.sin(time / 300 + idx) * 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawResourceBands(ctx, x, y, time, systemData) {
    const bands = systemData?.resourceBands ?? [
        { label: "IDEATION", value: 0.72 },
        { label: "BUILD", value: 0.58 },
        { label: "QA", value: 0.41 },
        { label: "DEPLOY", value: 0.86 },
    ];

    const baseY = y + 200;
    const width = 320;
    const height = 28;
    const gap = 18;

    bands.forEach((band, idx) => {
        const currentY = baseY + idx * (height + gap) + Math.sin(time / 1800 + idx) * 4;
        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.panelLine;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        drawRoundedRectPath(ctx, x - width / 2, currentY, width, height, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.neonCyan;
        ctx.font = fonts.label;
        ctx.fillText(band.label, x - width / 2 + 12, currentY + 18);

        const filledWidth = (width - 120) * (band.value ?? 0);
        ctx.fillStyle = colors.neonPink;
        ctx.fillRect(x - width / 2 + 110, currentY + 6, filledWidth, height - 12);

        ctx.fillStyle = colors.neonGreen;
        ctx.fillText(`${Math.round((band.value ?? 0) * 100)}%`, x + width / 2 - 60, currentY + 18);
    });
}

function drawDataFilaments(ctx, x, y, time, systemData, scanParams) {
    const threads = systemData?.aiThreads ?? 12;
    const intensity = scanParams?.scanProgress ?? 0.5;

    for (let i = 0; i < threads; i++) {
        const angle = (Math.PI * 2 * i) / threads + Math.sin(time / 1600 + i) * 0.2;
        const startRadius = 80 + Math.sin(time / 800 + i) * 20;
        const endRadius = 220 + Math.cos(time / 900 + i) * 25;

        const startX = x + Math.cos(angle) * startRadius;
        const startY = y + Math.sin(angle) * startRadius;
        const endX = x + Math.cos(angle) * endRadius;
        const endY = y + Math.sin(angle) * endRadius;

        const cp1X = x + Math.cos(angle + 0.5) * (startRadius + 40);
        const cp1Y = y + Math.sin(angle + 0.5) * (startRadius + 60);
        const cp2X = x + Math.cos(angle - 0.5) * (endRadius - 20);
        const cp2Y = y + Math.sin(angle - 0.5) * (endRadius - 40);

        ctx.strokeStyle = `rgba(0, 230, 255, ${0.2 + intensity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
        ctx.stroke();

        const packetPos = (time / 800 + i * 0.1) % 1;
        const packetX = bezierPoint(packetPos, startX, cp1X, cp2X, endX);
        const packetY = bezierPoint(packetPos, startY, cp1Y, cp2Y, endY);
        const pulse = 3 + Math.sin(time / 200 + i) * 1.5;

        ctx.fillStyle = colors.filament;
        ctx.beginPath();
        ctx.arc(packetX, packetY, pulse, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCore(ctx, x, y, time, scanParams, techParams) {
    const energy = scanParams?.scanProgress ?? 0.5;
    const beat = Math.sin(time / 220 + energy * 10) * 0.5 + 1;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 90);
    gradient.addColorStop(0, `rgba(255, 120, 180, ${0.7 + energy * 0.2})`);
    gradient.addColorStop(0.6, `rgba(255, 0, 204, ${0.5})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 90 + beat * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.ember;
    ctx.beginPath();
    ctx.arc(x, y, 40 + beat * 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.neonAmber;
    ctx.font = fonts.label;
    ctx.fillText("CORE HEAT", x - 38, y + 6);

    const forgeState = techParams?.forgeState ?? "SYNTH";
    ctx.fillStyle = colors.neonCyan;
    ctx.fillText(forgeState, x - ctx.measureText(forgeState).width / 2, y + 28);
}

function drawStatusBand(ctx, width, height, time, systemData, scanParams, techParams) {
    const bandHeight = 60;
    const y = height - bandHeight - 32;

    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(80, y, width - 160, bandHeight);

    ctx.strokeStyle = colors.panelLine;
    ctx.strokeRect(80, y, width - 160, bandHeight);

    const textEntries = [
        `SYNTH FLOW ${(techParams?.flowRate ?? 0.5).toFixed(2)}`,
        `AI THREADS ${systemData?.aiThreads ?? 12}`,
        `SCAN ${(scanParams?.scanProgress ?? 0).toFixed(2)}`,
        `COGNITION ${(techParams?.cognitionLink ?? 0.78).toFixed(2)}`,
    ];

    const combined = textEntries.join("  //  ");
    const scrollWidth = ctx.measureText(combined).width + width;
    const offset = (time / 9) % scrollWidth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(84, y + 10, width - 168, bandHeight - 20);
    ctx.clip();

    ctx.font = fonts.terminal;
    ctx.fillStyle = colors.neonGreen;
    ctx.fillText(combined, 84 - offset, y + bandHeight / 2 + 4);
    ctx.fillText(combined, 84 - offset + scrollWidth, y + bandHeight / 2 + 4);

    ctx.restore();
}

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

function bezierPoint(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    return (
        mt * mt * mt * p0 +
        3 * mt * mt * t * p1 +
        3 * mt * t * t * p2 +
        t * t * t * p3
    );
}
