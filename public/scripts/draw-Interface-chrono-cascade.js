export const colors = {
    background: "#04040a",
    frame: "rgba(0, 184, 255, 0.6)",
    frameGlow: "rgba(0, 255, 219, 0.28)",
    primaryText: "#dffcff",
    secondaryText: "rgba(184, 232, 255, 0.88)",
    tertiaryText: "rgba(135, 192, 220, 0.7)",
    timelineCard: "rgba(12, 32, 68, 0.4)",
    timelineCardHighlight: "rgba(50, 150, 255, 0.4)",
    timelineAccent: "#56ffe0",
    timelineGlow: "rgba(86, 255, 224, 0.55)",
    panel: "rgba(3, 24, 48, 0.6)",
    panelStroke: "rgba(58, 188, 255, 0.6)",
    sliderTrack: "rgba(0, 255, 255, 0.18)",
    sliderHandle: "#ffaf5f",
    leverStem: "rgba(55, 180, 255, 0.8)",
    leverTip: "rgba(255, 102, 190, 0.85)",
    knobFace: "rgba(0, 180, 200, 0.55)",
    knobHighlight: "rgba(255, 255, 255, 0.4)",
    tickerBg: "rgba(10, 30, 55, 0.75)",
    warning: "#ff667d",
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

    drawBackground(ctx, width, height, chromaticParams, timeNow);
    drawFrame(ctx, width, height);

    const timelineRect = {
        x: width / 2 - 140,
        y: 110,
        width: 280,
        height: height - 220,
    };

    drawHeader(ctx, width, timeNow, systemData);
    drawTimeline(ctx, timelineRect, systemData, techParams, timeNow);
    drawSideControls(ctx, width, height, timelineRect, techParams, timeNow);
    drawWorkflowIndicators(ctx, width, height, systemData, timeNow);
    drawBottomTicker(ctx, width, height, timeNow, techParams, systemData);
}

function drawBackground(ctx, width, height, chromaticParams, timeNow) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#050914");
    gradient.addColorStop(0.6, colors.background);
    gradient.addColorStop(1, "#010208");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.35 + chromaticParams.chromaticAberration * 0.4;
    ctx.strokeStyle = "rgba(0, 120, 255, 0.14)";
    ctx.lineWidth = 0.6;

    const gridSpacing = 46;
    const offset = (timeNow / 120) % gridSpacing;
    for (let x = -gridSpacing; x < width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
    }
    for (let y = -gridSpacing; y < height + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.7);
        ctx.lineTo(width, y + offset * 0.7);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFrame(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = colors.frame;
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colors.frameGlow;
    ctx.strokeRect(28, 28, width - 56, height - 56);
    ctx.restore();
}

function drawHeader(ctx, width, timeNow, systemData) {
    ctx.save();
    ctx.fillStyle = colors.panel;
    ctx.fillRect(32, 32, width - 64, 64);
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(32, 32, width - 64, 64);

    ctx.font = `700 20px ${fonts.header}`;
    ctx.fillStyle = colors.primaryText;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("CHRONO CASCADE WORKFLOW THEATRE", 52, 64);

    ctx.textAlign = "right";
    ctx.font = `600 13px ${fonts.primary}`;
    const activeFlow = systemData.activeFlow || "POLARIS STUDIO";
    ctx.fillText(`ACTIVE FLOW: ${activeFlow}`, width - 52, 56);
    ctx.font = `500 12px ${fonts.primary}`;
    ctx.fillStyle = colors.secondaryText;
    ctx.fillText(`SYNC ${(systemData.syncRatio || 0.82).toFixed(2)} • CONTEXT ${(systemData.contextRetention || 0.94).toFixed(2)}`, width - 52, 76);

    ctx.globalAlpha = 0.4 + 0.2 * Math.sin(timeNow / 520);
    ctx.strokeStyle = colors.timelineGlow;
    ctx.beginPath();
    ctx.moveTo(52, 88);
    ctx.lineTo(width - 52, 88);
    ctx.stroke();
    ctx.restore();
}

function drawTimeline(ctx, rect, systemData, techParams, timeNow) {
    const stages = systemData.workflowStages || [];
    const cascadeCount = Math.max(5, stages.length || 0);
    const cardHeight = rect.height / cascadeCount - 18;
    const scrollOffset = (timeNow / 900) % (cardHeight + 18);

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();

    for (let i = -2; i < cascadeCount + 2; i++) {
        const stageIndex = (i + stages.length) % stages.length;
        const stage = stages[stageIndex] || {
            name: `STAGE-${stageIndex + 1}`,
            owner: "AUTO",
            preview: "Awaiting capture",
            status: "PENDING",
        };
        const y = rect.y + i * (cardHeight + 18) + scrollOffset;
        drawTimelineCard(ctx, rect.x + 8, y, rect.width - 16, cardHeight, stage, techParams, timeNow, i);
    }

    ctx.restore();

    ctx.save();
    ctx.strokeStyle = colors.timelineAccent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rect.x + rect.width / 2, rect.y - 6);
    ctx.lineTo(rect.x + rect.width / 2, rect.y + rect.height + 6);
    ctx.stroke();
    ctx.restore();
}

function drawTimelineCard(ctx, x, y, width, height, stage, techParams, timeNow, index) {
    ctx.save();
    ctx.translate(x, y);

    const glow = Math.max(0.2, 0.4 + 0.25 * Math.sin(timeNow / (600 + index * 90)));
    ctx.fillStyle = stage.status === "ACTIVE" ? colors.timelineCardHighlight : colors.timelineCard;
    ctx.globalAlpha = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = colors.primaryText;
    ctx.font = `700 14px ${fonts.header}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(stage.name, 16, 12);

    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.secondaryText;
    ctx.fillText(`OWNER ${stage.owner}`, 16, 30);

    ctx.font = `500 10px ${fonts.primary}`;
    ctx.fillStyle = colors.tertiaryText;
    wrapText(ctx, stage.preview || "No preview available", 16, 48, width - 32, 14);

    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = colors.timelineAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width - 90, 14);
    ctx.lineTo(width - 16, 14);
    ctx.stroke();

    ctx.fillStyle = colors.secondaryText;
    ctx.font = `600 11px ${fonts.primary}`;
    ctx.textAlign = "right";
    ctx.fillText(stage.status, width - 16, height - 20);

    const sliderProgress = (stage.progress || 0.5) * (0.8 + 0.2 * Math.sin(timeNow / 700 + index));
    drawTimelineSlider(ctx, width - 118, height - 44, 90, sliderProgress, timeNow);

    ctx.restore();
}

function drawTimelineSlider(ctx, x, y, width, progress, timeNow) {
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = colors.sliderTrack;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();

    ctx.strokeStyle = colors.timelineAccent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * progress, 0);
    ctx.stroke();

    const handleX = width * progress;
    ctx.fillStyle = colors.sliderHandle;
    ctx.beginPath();
    ctx.arc(handleX, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.secondaryText;
    ctx.font = `600 10px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(progress * 100)}%`, handleX, -12);

    ctx.restore();
}

function drawSideControls(ctx, width, height, timelineRect, techParams, timeNow) {
    const leftX = timelineRect.x - 200;
    const rightX = timelineRect.x + timelineRect.width + 80;
    const controlHeight = timelineRect.height;

    drawControlPanel(ctx, leftX, timelineRect.y, 180, controlHeight, techParams, timeNow, true);
    drawControlPanel(ctx, rightX, timelineRect.y, 180, controlHeight, techParams, timeNow, false);
}

function drawControlPanel(ctx, x, y, width, height, techParams, timeNow, isLeft) {
    ctx.save();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1.2;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    ctx.font = `700 12px ${fonts.primary}`;
    ctx.fillStyle = colors.primaryText;
    ctx.textAlign = "center";
    ctx.fillText(isLeft ? "GESTURE INPUT" : "AI AUGMENT", x + width / 2, y + 28);

    ctx.beginPath();
    ctx.moveTo(x + 20, y + 42);
    ctx.lineTo(x + width - 20, y + 42);
    ctx.strokeStyle = colors.frameGlow;
    ctx.lineWidth = 1;
    ctx.stroke();

    const controlCount = 4;
    for (let i = 0; i < controlCount; i++) {
        const offsetY = y + 70 + i * ((height - 120) / controlCount);
        if (isLeft) {
            drawGestureLever(ctx, x + width / 2, offsetY, techParams, timeNow, i);
        } else {
            drawAIPod(ctx, x + width / 2, offsetY, techParams, timeNow, i);
        }
    }

    ctx.restore();
}

function drawGestureLever(ctx, x, y, techParams, timeNow, index) {
    ctx.save();
    const swing = Math.sin(timeNow / (700 + index * 120)) * 0.6;
    const length = 68;

    ctx.strokeStyle = colors.leverStem;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(swing) * length, y + Math.cos(swing) * length);
    ctx.stroke();

    ctx.fillStyle = colors.leverTip;
    ctx.beginPath();
    ctx.arc(x + Math.sin(swing) * length, y + Math.cos(swing) * length, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.secondaryText;
    ctx.font = `600 11px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(`GEST ${index + 1}`, x, y - 16);
    ctx.fillText(`${((techParams.gestureSensitivity || 0.5) * 100).toFixed(0)}%`, x, y + length + 18);
    ctx.restore();
}

function drawAIPod(ctx, x, y, techParams, timeNow, index) {
    ctx.save();
    const radius = 24;
    ctx.strokeStyle = colors.knobFace;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const angle = (timeNow / (900 - index * 40)) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    ctx.strokeStyle = colors.timelineAccent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colors.knobHighlight;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.secondaryText;
    ctx.textAlign = "center";
    ctx.fillText(`AI-${index + 1}`, x, y - radius - 10);
    ctx.fillText(`${((techParams.aiAllocation || 0.66) + index * 0.04).toFixed(2)}`, x, y + radius + 14);
    ctx.restore();
}

function drawWorkflowIndicators(ctx, width, height, systemData, timeNow) {
    ctx.save();
    ctx.font = `600 12px ${fonts.primary}`;
    ctx.fillStyle = colors.secondaryText;
    ctx.textAlign = "left";

    const leftMetrics = [
        `QUEUE ${(systemData.queueDepth || 5).toString().padStart(2, "0")}`,
        `FOCUS ${(systemData.focusRetention || 0.92).toFixed(2)}`,
        `FLOW ${(systemData.flowMomentum || 0.74).toFixed(2)}`,
    ];

    leftMetrics.forEach((text, index) => {
        ctx.globalAlpha = 0.6 + 0.25 * Math.sin(timeNow / (600 + index * 200));
        ctx.fillText(text, 48, height - 120 + index * 18);
    });

    ctx.textAlign = "right";
    const rightMetrics = [
        `MEM ${(systemData.memoryFootprint || 0.54).toFixed(2)}`,
        `AGENTS ${(systemData.agentCount || 3).toString().padStart(2, "0")}`,
        `THREAD ${(systemData.threadHarmony || 0.88).toFixed(2)}`,
    ];
    rightMetrics.forEach((text, index) => {
        ctx.globalAlpha = 0.55 + 0.25 * Math.sin(timeNow / (650 + index * 220));
        ctx.fillText(text, width - 48, height - 120 + index * 18);
    });

    ctx.restore();
}

function drawBottomTicker(ctx, width, height, timeNow, techParams, systemData) {
    const tickerHeight = 52;
    const y = height - tickerHeight - 36;

    ctx.save();
    ctx.fillStyle = colors.tickerBg;
    ctx.fillRect(80, y, width - 160, tickerHeight);
    ctx.strokeStyle = colors.panelStroke;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(80, y, width - 160, tickerHeight);

    ctx.font = `600 11px ${fonts.primary}`;
    ctx.fillStyle = colors.secondaryText;
    ctx.textAlign = "left";
    const suggestions = systemData.aiSuggestions || [
        "Gesture tap to summon chrono palette",
        "AI prepping translation layer for holowall",
        "Syncing memory palace to context anchors",
    ];
    const joined = suggestions.join(" • ");
    const textWidth = ctx.measureText(joined).width;
    const scroll = (timeNow / 18) % (textWidth + 220);

    ctx.save();
    ctx.beginPath();
    ctx.rect(92, y + 10, width - 184, tickerHeight - 20);
    ctx.clip();
    ctx.fillText(joined, 92 - scroll, y + tickerHeight / 2 + 4);
    ctx.fillText(joined, 92 - scroll + textWidth + 180, y + tickerHeight / 2 + 4);
    ctx.restore();

    ctx.font = `600 12px ${fonts.primary}`;
    ctx.textAlign = "right";
    ctx.fillText(`HAND LATENCY ${(techParams.handLatency || 18).toFixed(0)}MS`, width - 92, y + tickerHeight / 2 + 4);
    ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}
