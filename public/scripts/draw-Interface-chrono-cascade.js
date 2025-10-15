export const colors = {
    background: "#05040f",
    panelBase: "rgba(10, 16, 40, 0.85)",
    panelBorder: "rgba(95, 250, 255, 0.45)",
    cascadeCard: "rgba(34, 68, 110, 0.65)",
    cascadeHighlight: "rgba(145, 255, 236, 0.35)",
    cascadeShadow: "rgba(2, 4, 15, 0.5)",
    accentAmber: "#ffae5d",
    accentCyan: "#71f7ff",
    accentMagenta: "#f36dff",
    gridLine: "rgba(113, 247, 255, 0.18)",
    tickerBg: "rgba(12, 20, 48, 0.9)",
    tickerBorder: "rgba(145, 255, 236, 0.55)",
    controlBg: "rgba(18, 28, 54, 0.7)",
    controlGlow: "rgba(145, 255, 236, 0.6)",
    textPrimary: "#e6fcff",
    textSecondary: "rgba(230, 252, 255, 0.6)",
    textMuted: "rgba(112, 168, 196, 0.8)",
    scanline: "rgba(81, 172, 255, 0.08)",
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
    const timeNow = Date.now();

    drawBackground(ctx, width, height, timeNow);
    drawGridOverlay(ctx, width, height, timeNow);
    drawHeader(ctx, width, timeNow, systemData);
    drawChronoCascade(ctx, width, height, timeNow, systemData, scanParams);
    drawGesturalControls(ctx, width, height, timeNow, techParams);
    drawAIAssistTicker(ctx, width, height, timeNow, systemData);
    drawFooterDiagnostics(ctx, width, height, timeNow, chromaticParams);
    drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#05040f");
    gradient.addColorStop(0.4, "#06081a");
    gradient.addColorStop(1, "#03030a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const sweep = ctx.createRadialGradient(
        width / 2,
        height * 0.18,
        height * 0.1,
        width / 2,
        height / 2,
        height
    );
    sweep.addColorStop(0, "rgba(80, 120, 255, 0.22)");
    sweep.addColorStop(0.5, "rgba(20, 30, 60, 0.4)");
    sweep.addColorStop(1, "rgba(5, 4, 15, 0)");
    ctx.fillStyle = sweep;
    ctx.fillRect(0, 0, width, height);
}

function drawGridOverlay(ctx, width, height, time) {
    ctx.save();
    ctx.strokeStyle = colors.gridLine;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 0.8;

    const offset = (time / 180) % 50;
    for (let x = -50; x < width + 50; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 60);
        ctx.lineTo(x + offset, height - 60);
        ctx.stroke();
    }
    for (let y = 60; y < height - 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(60, y + offset * 0.4);
        ctx.lineTo(width - 60, y + offset * 0.4);
        ctx.stroke();
    }
    ctx.restore();
}

function drawHeader(ctx, width, time, systemData) {
    ctx.save();
    ctx.fillStyle = colors.panelBase;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(40, 28, width - 80, 70);

    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.95;
    ctx.strokeRect(40, 28, width - 80, 70);

    ctx.font = `26px ${fonts.header}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "center";
    ctx.fillText("CHRONO CASCADE WORKFLOW", width / 2, 62);

    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    const cycle = Math.abs(Math.sin(time / 2200));
    const active = systemData?.activeWorkflow || "SYNTH LAB";
    ctx.fillText(
        `${active} • FLOW COHERENCE ${(cycle * 100).toFixed(1)}%`,
        width / 2,
        84
    );
    ctx.restore();
}

function drawChronoCascade(ctx, width, height, time, systemData, scanParams) {
    const stages = systemData?.workflowStages || [
        {
            name: "IDEATION",
            owner: "AI SKETCH",
            eta: "+6m",
            focus: "Prompt lattice",
        },
        {
            name: "PROTOTYPE",
            owner: "YOU",
            eta: "NOW",
            focus: "Shader sculpt",
        },
        {
            name: "REVIEW",
            owner: "COBOT",
            eta: "-8m",
            focus: "Telemetry QA",
        },
        {
            name: "DEPLOY",
            owner: "OPS NET",
            eta: "-24m",
            focus: "Stream sync",
        },
    ];

    const centerX = width / 2;
    const topY = 130;
    const cascadeWidth = 320;
    const cardHeight = 110;

    stages.forEach((stage, index) => {
        const depth = index * 40;
        const y = topY + index * (cardHeight * 0.72);
        const cardY = y + Math.sin(time / 1600 + index) * 6;
        const skew = (index % 2 === 0 ? 1 : -1) * 12;

        drawCascadeCard(ctx, centerX, cardY, cascadeWidth - depth, cardHeight, skew, stage, index, scanParams);
    });

    drawTimelineSpine(ctx, centerX, topY - 40, height - 180, time, stages.length);
}

function drawCascadeCard(ctx, centerX, y, width, height, skew, stage, index, scanParams) {
    ctx.save();
    ctx.translate(centerX, y);
    ctx.transform(1, 0, skew * 0.0025, 1, 0, 0);

    ctx.fillStyle = colors.cascadeCard;
    ctx.globalAlpha = 0.82;
    ctx.fillRect(-width / 2, 0, width, height);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-width / 2, 0, width, height);

    const glow = Math.sin(Date.now() / 1400 + index) * 0.5 + 0.5;
    ctx.fillStyle = "rgba(145, 255, 236, 0.08)";
    ctx.fillRect(-width / 2, 0, width, height * glow * 0.6);

    ctx.fillStyle = colors.textMuted;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "left";
    ctx.fillText(stage.owner, -width / 2 + 16, 22);

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `20px ${fonts.header}`;
    ctx.fillText(stage.name, -width / 2 + 16, 48);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillText(stage.focus, -width / 2 + 16, 68);

    ctx.fillStyle = colors.accentAmber;
    ctx.font = `12px ${fonts.header}`;
    ctx.textAlign = "right";
    ctx.fillText(stage.eta, width / 2 - 16, 26);

    const progress = scanParams?.scanProgress || 0;
    drawStageProgress(ctx, -width / 2 + 16, height - 24, width - 32, progress, index);

    ctx.restore();
}

function drawStageProgress(ctx, x, y, width, progress, index) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = colors.cascadeShadow;
    ctx.fillRect(x, y, width, 10);

    const modulated = Math.max(0.05, Math.sin(Date.now() / 1200 + index) * 0.2 + progress);
    ctx.globalAlpha = 0.9;
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, colors.accentCyan);
    gradient.addColorStop(1, colors.accentMagenta);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * Math.min(modulated, 1), 10);

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `9px ${fonts.terminal}`;
    ctx.fillText(`${Math.round(Math.min(modulated, 1) * 100)}%`, x + width - 36, y + 8);
    ctx.restore();
}

function drawTimelineSpine(ctx, x, top, height, time, stageCount) {
    ctx.save();
    ctx.strokeStyle = colors.accentCyan;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + height);
    ctx.stroke();

    for (let i = 0; i < stageCount; i++) {
        const y = top + (height / (stageCount - 1 || 1)) * i;
        const pulse = Math.sin(time / 700 + i) * 6;
        ctx.beginPath();
        ctx.arc(x, y + pulse, 12, 0, Math.PI * 2);
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = colors.accentMagenta;
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = colors.accentCyan;
        ctx.stroke();
    }

    ctx.restore();
}

function drawGesturalControls(ctx, width, height, time, techParams) {
    const controlSets = [
        {
            type: "slider",
            label: "FLOW WIDTH",
            value: techParams?.energyLevel ? techParams.energyLevel / 100 : 0.62,
            position: 0.22,
        },
        {
            type: "dial",
            label: "DEPTH", 
            value: (techParams?.orientation || 45) / 90,
            position: 0.78,
        },
        {
            type: "lever",
            label: "SYNC",
            value: techParams?.stability ?? 0.48,
            position: 0.18,
        },
        {
            type: "joystick",
            label: "FOCUS",
            value: techParams?.focusVector || { x: 0.2, y: -0.3 },
            position: 0.82,
        },
    ];

    controlSets.forEach((control, index) => {
        const x = width * control.position;
        const y = 160 + index * 120;
        drawControlModule(ctx, x, y, control, time);
    });
}

function drawControlModule(ctx, x, y, control, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors.controlBg;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(-90, -40, 180, 80);

    ctx.strokeStyle = colors.panelBorder;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-90, -40, 180, 80);

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText(control.label, 0, -16);

    switch (control.type) {
        case "slider":
            drawSlider(ctx, control.value, time);
            break;
        case "dial":
            drawDial(ctx, control.value, time);
            break;
        case "lever":
            drawLever(ctx, control.value, time);
            break;
        case "joystick":
            drawJoystick(ctx, control.value, time);
            break;
        default:
            break;
    }

    ctx.restore();
}

function drawSlider(ctx, value, time) {
    ctx.save();
    const clamped = Math.max(0, Math.min(1, value));
    ctx.strokeStyle = colors.controlGlow;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-60, 10);
    ctx.lineTo(60, 10);
    ctx.stroke();

    ctx.fillStyle = colors.accentCyan;
    const handleX = -60 + 120 * clamped;
    const oscillation = Math.sin(time / 600) * 4;
    ctx.beginPath();
    ctx.arc(handleX, 10 + oscillation, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawDial(ctx, value, time) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 6, 28, Math.PI, 0);
    ctx.strokeStyle = colors.controlGlow;
    ctx.lineWidth = 3;
    ctx.stroke();

    const angle = Math.PI * value;
    ctx.strokeStyle = colors.accentAmber;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 6, 28, Math.PI, Math.PI + angle, false);
    ctx.stroke();

    ctx.fillStyle = colors.accentMagenta;
    ctx.beginPath();
    ctx.arc(Math.cos(Math.PI + angle) * 28, 6 + Math.sin(Math.PI + angle) * 28, 6 + Math.sin(time / 500) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawLever(ctx, value, time) {
    ctx.save();
    const angle = -Math.PI / 4 + value * (Math.PI / 2);
    ctx.strokeStyle = colors.controlGlow;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-40, 18);
    ctx.lineTo(40, 18);
    ctx.stroke();

    ctx.translate(0, 18);
    ctx.rotate(angle);
    ctx.fillStyle = colors.accentCyan;
    ctx.beginPath();
    drawRoundedRectPath(ctx, -6, -36, 12, 36, 6);
    ctx.fill();

    ctx.fillStyle = colors.accentAmber;
    ctx.beginPath();
    ctx.arc(0, -36, 10 + Math.sin(time / 300) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawJoystick(ctx, vector, time) {
    ctx.save();
    ctx.strokeStyle = colors.controlGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 14, 26, 0, Math.PI * 2);
    ctx.stroke();

    const vx = Math.max(-1, Math.min(1, vector?.x ?? 0));
    const vy = Math.max(-1, Math.min(1, vector?.y ?? 0));
    const handleX = vx * 18;
    const handleY = vy * 18 + Math.sin(time / 300) * 2;

    ctx.fillStyle = colors.accentMagenta;
    ctx.beginPath();
    ctx.arc(handleX, 14 + handleY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawAIAssistTicker(ctx, width, height, time, systemData) {
    ctx.save();
    ctx.fillStyle = colors.tickerBg;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(60, height - 110, width - 120, 60);

    ctx.strokeStyle = colors.tickerBorder;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 1;
    ctx.strokeRect(60, height - 110, width - 120, 60);

    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "left";
    ctx.fillText("AI SYNTH TICKER", 80, height - 82);

    const suggestions = systemData?.aiSuggestions || [
        "AUTOGEN: Context pack ready for deploy.",
        "HANDOFF: Research agent primed with citations.",
        "SYNC: Motion capture buffer normalized.",
    ];

    const scrollOffset = (time / 20) % (width - 180);
    ctx.save();
    ctx.beginPath();
    ctx.rect(200, height - 100, width - 260, 40);
    ctx.clip();
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `12px ${fonts.terminal}`;

    suggestions.forEach((entry, index) => {
        const x = width - 160 - scrollOffset + index * 280;
        ctx.fillText(entry, x, height - 74);
    });
    ctx.restore();
    ctx.restore();
}

function drawFooterDiagnostics(ctx, width, height, time, chromaticParams) {
    ctx.save();
    ctx.fillStyle = colors.panelBase;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(40, height - 40, width - 80, 28);

    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 1;
    ctx.strokeRect(40, height - 40, width - 80, 28);

    const items = [
        `SCAN ${(chromaticParams?.offset || 0).toFixed(2)}`,
        `LAT ${(Math.sin(time / 1800) * 40 + 42).toFixed(1)}ms`,
        `THERM ${(Math.sin(time / 900) * 3 + 27).toFixed(1)}°C`,
        `COHERENCE ${(Math.cos(time / 2000) * 0.5 + 0.5).toFixed(2)}`,
    ];

    ctx.font = `10px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "center";
    items.forEach((item, index) => {
        const x = 80 + index * ((width - 160) / items.length);
        ctx.fillText(item, x, height - 22);
    });
    ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
    ctx.save();
    ctx.fillStyle = colors.scanline;
    const offset = (time / 60) % 6;
    for (let y = 0; y < height; y += 6) {
        ctx.fillRect(0, y + offset, width, 2);
    }
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
