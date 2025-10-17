export const colors = {
    background: "#05040e",
    timelineGlow: "#7f5bff",
    timelineAccent: "#ffb86c",
    cardFront: "rgba(30, 22, 66, 0.85)",
    cardBack: "rgba(10, 6, 20, 0.65)",
    chrome: "rgba(150, 130, 255, 0.8)",
    textPrimary: "#f0eaff",
    textSecondary: "#bcb3ff",
    controlNeon: "#5af1ff",
    controlShadow: "rgba(0, 150, 255, 0.4)",
    tickerBg: "rgba(18, 12, 40, 0.9)",
    tickerAccent: "#00ffd0",
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
    systemData = systemData || {};
    const timeNow = Date.now();

    drawBackground(ctx, width, height, timeNow);
    drawOuterFrame(ctx, width, height);
    drawChronoTimeline(ctx, width, height, timeNow, systemData);
    drawCascadeCards(ctx, width, height, timeNow, systemData);
    drawGesturalControls(ctx, width, height, timeNow, techParams);
    drawAISideTicker(ctx, width, height, timeNow, systemData);
    drawFooterReadout(ctx, width, height, timeNow, scanParams);
}

function drawBackground(ctx, width, height, time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0b0620");
    gradient.addColorStop(0.5, "#05040e");
    gradient.addColorStop(1, "#03020a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.12;
    const gridSize = 36;
    const offset = (time / 150) % gridSize;
    ctx.strokeStyle = "rgba(120, 90, 200, 0.35)";
    ctx.lineWidth = 0.6;
    for (let x = -gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
    }
    for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.6);
        ctx.lineTo(width, y + offset * 0.6);
        ctx.stroke();
    }
    ctx.restore();
}

function drawOuterFrame(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = colors.chrome;
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, width - 36, height - 36);
    ctx.strokeRect(32, 32, width - 64, height - 64);
    ctx.restore();
}

function drawChronoTimeline(ctx, width, height, time, systemData) {
    const centerX = width / 2;
    const top = 70;
    const bottom = height - 110;
    const glow = 15 + Math.sin(time / 500) * 5;

    ctx.save();
    ctx.strokeStyle = colors.timelineGlow;
    ctx.shadowColor = colors.timelineGlow;
    ctx.shadowBlur = glow;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX, top);
    ctx.lineTo(centerX, bottom);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.timelineAccent;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, top + 30);
    ctx.lineTo(centerX + 20, top + 30);
    ctx.moveTo(centerX - 20, bottom - 30);
    ctx.lineTo(centerX + 20, bottom - 30);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = colors.textSecondary;
    ctx.font = "15px " + fonts.header;
    ctx.textAlign = "center";
    ctx.fillText("CHRONO CASCADE", centerX, top - 24);
    const now = systemData?.currentEpoch || new Date().toISOString();
    ctx.font = "12px " + fonts.primary;
    ctx.fillText(now.toUpperCase(), centerX, bottom + 24);
    ctx.restore();
}

function drawCascadeCards(ctx, width, height, time, systemData) {
    const stages = systemData?.workflowStages || [];
    const centerX = width / 2;
    const top = 100;
    const bottom = height - 140;
    const availableHeight = bottom - top;
    const maxCards = Math.max(stages.length, 5);
    const cardSpacing = availableHeight / maxCards;

    stages.slice(0, 8).forEach((stage, index) => {
        const y = top + index * cardSpacing + Math.sin(time / 700 + index) * 6;
        drawCascadeCard(ctx, centerX, y, cardSpacing * 0.62, index, stage, time);
    });

    if (!stages.length) {
        for (let i = 0; i < 5; i++) {
            const y = top + i * cardSpacing;
            drawCascadeCard(ctx, centerX, y, cardSpacing * 0.62, i, {
                name: "EMPTY SLOT",
                owner: "—",
                state: "AWAITING CAPTURE",
                confidence: 0,
            }, time);
        }
    }
}

function drawCascadeCard(ctx, centerX, y, height, index, stage, time) {
    const width = 260;
    const isPrimary = index === 0;
    const skew = 12;
    const depthOffset = index * 16;
    const wobble = Math.sin(time / 900 + index) * 4;

    ctx.save();
    ctx.translate(centerX, y + wobble);

    ctx.fillStyle = colors.cardBack;
    ctx.beginPath();
    ctx.moveTo(-width / 2 - skew, -height / 2 - depthOffset);
    ctx.lineTo(width / 2 + skew, -height / 2 - depthOffset + 12);
    ctx.lineTo(width / 2, height / 2 - depthOffset + 18);
    ctx.lineTo(-width / 2, height / 2 - depthOffset + 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isPrimary ? colors.cardFront : "rgba(24, 16, 44, 0.7)";
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.lineTo(width / 2, -height / 2 + 12);
    ctx.lineTo(width / 2 - skew, height / 2 + 8);
    ctx.lineTo(-width / 2 - skew, height / 2 - 6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.chrome;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.lineTo(width / 2, -height / 2 + 12);
    ctx.lineTo(width / 2 - skew, height / 2 + 8);
    ctx.lineTo(-width / 2 - skew, height / 2 - 6);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "15px " + fonts.header;
    ctx.textAlign = "left";
    ctx.fillText((stage.name || `STAGE ${index + 1}`).toUpperCase(), -width / 2 + 20, -height / 2 + 26);

    ctx.font = "12px " + fonts.primary;
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`OWNER ${stage.owner || "AI COHORT"}`.toUpperCase(), -width / 2 + 20, -height / 2 + 46);
    ctx.fillText(`STATUS ${stage.state || "QUEUED"}`.toUpperCase(), -width / 2 + 20, -height / 2 + 64);

    const progress = stage.progress ?? stage.confidence ?? 0.5;
    const barWidth = width - 80;
    ctx.strokeStyle = colors.controlNeon;
    ctx.strokeRect(-width / 2 + 20, height / 2 - 32, barWidth, 12);
    ctx.fillStyle = `rgba(90, 241, 255, ${0.4 + progress * 0.4})`;
    ctx.fillRect(-width / 2 + 20, height / 2 - 32, barWidth * progress, 12);

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "11px " + fonts.terminal;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(progress * 100)}% SYNC`, width / 2 - 20, height / 2 - 22);

    ctx.restore();
}

function drawGesturalControls(ctx, width, height, time, techParams) {
    const controlRadius = 70;
    const leftX = width * 0.23;
    const rightX = width * 0.77;
    const centerY = height * 0.55;

    drawSliderColumn(ctx, leftX, centerY, controlRadius, time, techParams);
    drawLeverColumn(ctx, rightX, centerY, controlRadius, time, techParams);
}

function drawSliderColumn(ctx, x, centerY, radius, time, techParams) {
    ctx.save();
    ctx.translate(x, centerY);
    ctx.strokeStyle = colors.chrome;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.rect(-80, -140, 160, 280);
    ctx.stroke();

    const sliders = [
        { label: "FOCUS", value: techParams.focusFactor ?? 0.68 },
        { label: "AI BIND", value: techParams.aiBinding ?? 0.52 },
        { label: "FLOW", value: techParams.flowRate ?? 0.75 },
    ];

    sliders.forEach((slider, index) => {
        const y = -100 + index * 90;
        ctx.fillStyle = "rgba(40, 25, 70, 0.8)";
        ctx.fillRect(-60, y, 120, 60);
        ctx.strokeStyle = colors.controlNeon;
        ctx.strokeRect(-60, y, 120, 60);

        const knobY = y + 48 - slider.value * 48;
        ctx.fillStyle = colors.controlNeon;
        ctx.shadowColor = colors.controlShadow;
        ctx.shadowBlur = 12 + Math.sin(time / 600 + index) * 4;
        ctx.fillRect(-8, knobY - 16, 16, 32);
        ctx.shadowBlur = 0;

        ctx.fillStyle = colors.textSecondary;
        ctx.font = "11px " + fonts.primary;
        ctx.textAlign = "center";
        ctx.fillText(slider.label, 0, y + 18);
        ctx.fillText(`${Math.round(slider.value * 100)}%`, 0, knobY - 24);
    });
    ctx.restore();
}

function drawLeverColumn(ctx, x, centerY, radius, time, techParams) {
    ctx.save();
    ctx.translate(x, centerY);
    ctx.strokeStyle = colors.chrome;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.rect(-80, -140, 160, 280);
    ctx.stroke();

    const levers = [
        { label: "DEPLOY", value: techParams.deployReadiness ?? 0.4 },
        { label: "IMMERSION", value: techParams.immersionGain ?? 0.6 },
        { label: "DEFLECT", value: techParams.deflection ?? 0.3 },
    ];

    levers.forEach((lever, index) => {
        const y = -100 + index * 90;
        ctx.fillStyle = "rgba(20, 16, 44, 0.9)";
        ctx.fillRect(-60, y, 120, 60);
        ctx.strokeStyle = colors.controlNeon;
        ctx.strokeRect(-60, y, 120, 60);

        const angle = (lever.value - 0.5) * Math.PI / 3 + Math.sin(time / 1000 + index) * 0.08;
        const length = 36;
        ctx.save();
        ctx.translate(0, y + 40);
        ctx.rotate(angle);
        ctx.fillStyle = colors.controlNeon;
        ctx.shadowColor = colors.controlShadow;
        ctx.shadowBlur = 10;
        ctx.fillRect(-4, -length, 8, length);
        ctx.beginPath();
        ctx.arc(0, -length, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = colors.textSecondary;
        ctx.font = "11px " + fonts.primary;
        ctx.textAlign = "center";
        ctx.fillText(lever.label, 0, y + 18);
        ctx.fillText(`${Math.round(lever.value * 100)}%`, 0, y + 58);
    });
    ctx.restore();
}

function drawAISideTicker(ctx, width, height, time, systemData) {
    const tickerWidth = 180;
    const x = width - tickerWidth - 40;
    const y = 80;
    const tickerHeight = height - 200;

    ctx.fillStyle = colors.tickerBg;
    ctx.fillRect(x, y, tickerWidth, tickerHeight);
    ctx.strokeStyle = colors.chrome;
    ctx.strokeRect(x, y, tickerWidth, tickerHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, tickerWidth, tickerHeight);
    ctx.clip();

    const suggestions = systemData?.aiSuggestions?.length
        ? systemData.aiSuggestions
        : [
            { title: "Pinch to expand stage", status: "gesture ready" },
            { title: "Auto-assign reviewer", status: "confidence 92%" },
            { title: "Link research stream", status: "awaiting nod" },
        ];

    const scroll = (time / 70) % (suggestions.length * 160);

    suggestions.forEach((suggestion, index) => {
        const yOffset = y + tickerHeight - 40 - scroll + index * 160;
        ctx.fillStyle = colors.textSecondary;
        ctx.font = "12px " + fonts.header;
        ctx.fillText(suggestion.title.toUpperCase(), x + 20, yOffset);
        ctx.fillStyle = colors.tickerAccent;
        ctx.font = "11px " + fonts.terminal;
        ctx.fillText((suggestion.status || "READY").toUpperCase(), x + 20, yOffset + 20);
        ctx.strokeStyle = "rgba(80, 190, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(x + 12, yOffset + 32);
        ctx.lineTo(x + tickerWidth - 12, yOffset + 32);
        ctx.stroke();
    });

    ctx.restore();
}

function drawFooterReadout(ctx, width, height, time, scanParams) {
    const footerHeight = 60;
    const y = height - footerHeight - 40;
    ctx.fillStyle = "rgba(14, 10, 30, 0.9)";
    ctx.fillRect(60, y, width - 120, footerHeight);
    ctx.strokeStyle = colors.chrome;
    ctx.strokeRect(60, y, width - 120, footerHeight);

    const items = [
        { label: "SCAN", value: `${Math.round((scanParams?.scanProgress || 0) * 100)}%` },
        { label: "LATENCY", value: `${(scanParams?.latency || 18).toFixed(1)}MS` },
        { label: "FOCUS", value: `${Math.round((scanParams?.focusSync || 0.76) * 100)}%` },
        { label: "CASCADE", value: `${Math.round((scanParams?.cascadeHealth || 0.84) * 100)}%` },
    ];

    ctx.fillStyle = colors.textPrimary;
    ctx.font = "12px " + fonts.header;
    ctx.textAlign = "center";
    items.forEach((item, index) => {
        const x = 80 + index * ((width - 160) / items.length);
        ctx.fillText(item.label, x, y + 22);
        ctx.font = "14px " + fonts.display;
        ctx.fillText(item.value, x, y + 44);
        ctx.font = "12px " + fonts.header;
    });
}
