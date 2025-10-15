export const colors = {
    background: "#04010a",
    outerRing: "rgba(255, 0, 140, 0.55)",
    midRing: "rgba(0, 210, 255, 0.6)",
    innerRing: "rgba(150, 255, 120, 0.7)",
    coreGlow: "#ff9f1c",
    forgePlasma: "#ff5e78",
    gaugeTrack: "rgba(40, 18, 60, 0.9)",
    gaugeFill: "#54f2f2",
    textPrimary: "#f6f7ff",
    textSecondary: "#9fffd1",
    filament: "rgba(80, 255, 200, 0.7)",
    panelBorder: "rgba(255, 120, 210, 0.6)",
    scanline: "rgba(255, 255, 255, 0.08)",
    hoverGlow: "rgba(255, 255, 255, 0.4)",
};

export const fonts = {
    primary: "'Courier New', 'Courier', monospace",
    header: "bold 'Courier New', 'Courier', monospace",
    terminal: "'Courier New', 'Courier', monospace",
    display: "'Courier New', 'Courier', monospace",
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
    scanParams = scanParams || {};
    techParams = techParams || {};
    chromaticParams = chromaticParams || {};
    systemData = systemData || {};
    const timeNow = Date.now();
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    drawBackground(ctx, width, height, timeNow);
    drawConcentricForge(ctx, centerX, centerY, timeNow, techParams);
    drawGauges(ctx, centerX, centerY, timeNow, techParams, scanParams);
    drawHoverIndicators(ctx, centerX, centerY, timeNow, chromaticParams);
    drawFilamentStreams(ctx, centerX, centerY, timeNow, systemData);
    drawStatusPanels(ctx, width, height, timeNow, techParams, scanParams);
    drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height, time) {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    gradient.addColorStop(0, "#0d0018");
    gradient.addColorStop(0.6, "#060013");
    gradient.addColorStop(1, "#010005");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 80; i++) {
        const angle = (i / 80) * Math.PI * 2;
        const radius = (width * 0.45) + Math.sin(time / 3000 + i) * 20;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        ctx.fillStyle = `rgba(80, 40, 120, ${(Math.sin(time / 700 + i) * 0.3) + 0.4})`;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
}

function drawConcentricForge(ctx, centerX, centerY, time, techParams) {
    const rings = [
        { radius: 220, color: colors.outerRing, thickness: 18, pulse: 0.6 },
        { radius: 150, color: colors.midRing, thickness: 16, pulse: 0.8 },
        { radius: 90, color: colors.innerRing, thickness: 14, pulse: 1.0 },
    ];

    ctx.save();
    ctx.lineCap = "round";
    rings.forEach((ring, index) => {
        const jitter = Math.sin(time / (900 - index * 120)) * 6;
        const sweep = Math.PI * (1.5 + Math.sin(time / 1400 + index) * 0.4);
        const offset = (time / (2200 - index * 200)) + index;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.thickness;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius + jitter, offset, offset + sweep);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius + jitter, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.restore();

    drawMoltenCore(ctx, centerX, centerY, time, techParams);
}

function drawMoltenCore(ctx, centerX, centerY, time, techParams) {
    const pulse = 1 + Math.sin(time / 400) * 0.12;
    const workload = (techParams?.forgeLoad ?? 0.7);
    const coreRadius = 48 + workload * 30;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 1.4);
    gradient.addColorStop(0, "#ffd166");
    gradient.addColorStop(0.45, colors.coreGlow);
    gradient.addColorStop(1, "rgba(255, 94, 120, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = colors.forgePlasma;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "16px " + fonts.display;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "center";
    ctx.fillText("SYNAPTIC CORE", centerX, centerY + coreRadius + 24);
    ctx.fillText(`${Math.round(workload * 100)}% CHARGE`, centerX, centerY + coreRadius + 44);
    ctx.restore();
}

function drawGauges(ctx, centerX, centerY, time, techParams, scanParams) {
    const gauges = [
        {
            label: "RESOURCE ALLOCATION",
            radius: 200,
            value: techParams.resourceAllocation ?? 0.58,
            start: -Math.PI * 0.7,
            end: Math.PI * 0.2,
        },
        {
            label: "INSPIRATION VECTOR",
            radius: 135,
            value: scanParams?.inspirationLevel ?? 0.74,
            start: -Math.PI * 0.8,
            end: Math.PI * 0.1,
        },
        {
            label: "SYNERGY",
            radius: 70,
            value: techParams.synergyDial ?? 0.63,
            start: -Math.PI * 0.9,
            end: Math.PI * 0.05,
        },
    ];

    gauges.forEach((gauge, index) => {
        drawArcGauge(ctx, centerX, centerY, gauge, index, time);
    });
}

function drawArcGauge(ctx, cx, cy, gauge, index, time) {
    const sweep = gauge.end - gauge.start;
    const valueAngle = gauge.start + sweep * gauge.value;

    ctx.save();
    ctx.strokeStyle = colors.gaugeTrack;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, gauge.radius, gauge.start, gauge.end);
    ctx.stroke();

    ctx.strokeStyle = colors.gaugeFill;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, gauge.radius, gauge.start, valueAngle);
    ctx.stroke();

    const knobX = cx + Math.cos(valueAngle) * gauge.radius;
    const knobY = cy + Math.sin(valueAngle) * gauge.radius;
    ctx.fillStyle = colors.gaugeFill;
    ctx.shadowColor = colors.hoverGlow;
    ctx.shadowBlur = 14 + Math.sin(time / 600 + index) * 4;
    ctx.beginPath();
    ctx.arc(knobX, knobY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.textSecondary;
    ctx.font = "12px " + fonts.header;
    ctx.textAlign = "center";
    ctx.fillText(gauge.label, cx, cy - gauge.radius - 20);
    ctx.font = "14px " + fonts.display;
    ctx.fillText(`${Math.round(gauge.value * 100)}%`, cx, cy - gauge.radius - 2);
    ctx.restore();
}

function drawHoverIndicators(ctx, centerX, centerY, time, chromaticParams) {
    const hoverLevel = chromaticParams?.proximity ?? 0.5;
    const count = 6;

    ctx.save();
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time / 1500;
        const radius = 250 + Math.sin(time / 800 + i) * 8;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const alpha = 0.2 + hoverLevel * 0.6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 14 + hoverLevel * 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(centerX + Math.cos(angle) * 90, centerY + Math.sin(angle) * 90);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFilamentStreams(ctx, centerX, centerY, time, systemData) {
    const filaments = systemData?.aiStreams || [];
    const max = Math.max(5, filaments.length);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < max; i++) {
        const angle = (i / max) * Math.PI * 2 + Math.sin(time / 1600 + i) * 0.2;
        const radius = 260;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.strokeStyle = colors.filament;
        ctx.lineWidth = 2 + Math.sin(time / 500 + i) * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const controlX = centerX + Math.cos(angle) * 120 + Math.sin(time / 900 + i) * 40;
        const controlY = centerY + Math.sin(angle) * 120 + Math.cos(time / 1100 + i) * 30;
        ctx.quadraticCurveTo(controlX, controlY, centerX, centerY);
        ctx.stroke();

        const label = filaments[i]?.label || `AI-FLOW ${i + 1}`;
        ctx.fillStyle = colors.textSecondary;
        ctx.font = "11px " + fonts.terminal;
        ctx.textAlign = "center";
        ctx.fillText(label, x, y - 12);
    }
    ctx.restore();
}

function drawStatusPanels(ctx, width, height, time, techParams, scanParams) {
    const panelWidth = 220;
    const panelHeight = 120;

    const panels = [
        {
            x: 40,
            y: height * 0.18,
            title: "FORGE TELEMETRY",
            lines: [
                `THERMAL ${formatPercent(techParams.thermalLoad, 0.62)}`,
                `FEEDBACK ${formatPercent(techParams.feedbackLoop, 0.44)}`,
                `CHARGE ${formatPercent(techParams.forgeLoad, 0.7)}`,
            ],
        },
        {
            x: width - panelWidth - 40,
            y: height * 0.18,
            title: "SCAN BINDINGS",
            lines: [
                `RESOLUTION ${formatPercent(scanParams?.resolution, 0.82)}`,
                `LATENCY ${formatMs(scanParams?.latency, 14)}`,
                `COHERENCE ${formatPercent(scanParams?.coherence, 0.91)}`,
            ],
        },
    ];

    panels.forEach((panel, index) => {
        const shimmer = 0.3 + 0.15 * Math.sin(time / 700 + index);
        ctx.fillStyle = `rgba(20, 8, 40, ${0.6 + shimmer})`;
        ctx.fillRect(panel.x, panel.y, panelWidth, panelHeight);
        ctx.strokeStyle = colors.panelBorder;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(panel.x, panel.y, panelWidth, panelHeight);

        ctx.fillStyle = colors.textPrimary;
        ctx.font = "14px " + fonts.header;
        ctx.fillText(panel.title, panel.x + 16, panel.y + 26);

        ctx.font = "12px " + fonts.terminal;
        panel.lines.forEach((line, lineIndex) => {
            ctx.fillStyle = `rgba(180, 255, 240, ${0.9 - lineIndex * 0.2})`;
            ctx.fillText(line, panel.x + 16, panel.y + 48 + lineIndex * 20);
        });
    });
}

function formatPercent(value, fallback = 0) {
    const num = (value ?? fallback) * 100;
    return `${num.toFixed(1)}%`;
}

function formatMs(value, fallback = 0) {
    const num = value ?? fallback;
    return `${num.toFixed(1)}MS`;
}

function drawScanlines(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    for (let y = 0; y < height; y += 3) {
        const alpha = 0.05 + 0.05 * Math.sin((time / 120) + y * 0.05);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(0, y, width, 1);
    }
    ctx.restore();
}
