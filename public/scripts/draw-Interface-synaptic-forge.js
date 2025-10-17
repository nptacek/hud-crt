export const colors = {
    background: "#05020d",
    deepGlow: "rgba(18, 8, 45, 0.95)",
    forgeCore: "#ff6f3c",
    forgeHalo: "rgba(255, 155, 96, 0.4)",
    neonCyan: "#23f3ff",
    neonMagenta: "#ff4fb0",
    neonViolet: "#a974ff",
    neonAmber: "#ffb347",
    panelBg: "rgba(12, 18, 40, 0.5)",
    panelBorder: "rgba(60, 130, 255, 0.6)",
    textPrimary: "#f4f9ff",
    textSecondary: "rgba(205, 220, 255, 0.82)",
    ringOutline: "rgba(84, 163, 255, 0.38)",
    ringHighlight: "rgba(35, 243, 255, 0.45)",
    aiFilament: "rgba(111, 255, 219, 0.65)",
    aiFilamentAlt: "rgba(255, 122, 244, 0.55)",
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
    const centerX = width / 2;
    const centerY = height / 2;
    const timeNow = Date.now();

    drawBackground(ctx, width, height, timeNow, chromaticParams);
    drawFrame(ctx, width, height);
    drawHeader(ctx, width, timeNow, systemData);

    drawForgeCore(ctx, centerX, centerY, scanParams, techParams, timeNow);
    drawOuterRingControls(ctx, centerX, centerY, width, height, techParams, systemData, timeNow);
    drawMidRingControls(ctx, centerX, centerY, techParams, systemData, timeNow);
    drawInnerRingControls(ctx, centerX, centerY, scanParams, techParams, timeNow);
    drawAIStreams(ctx, centerX, centerY, systemData, timeNow);
    drawStatusBands(ctx, width, height, timeNow, techParams, systemData);
}

function drawBackground(ctx, width, height, timeNow, chromaticParams) {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, "#0b0218");
    gradient.addColorStop(0.5, colors.background);
    gradient.addColorStop(1, "#010005");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.18 + chromaticParams.chromaticAberration * 0.2;
    ctx.strokeStyle = "rgba(68, 0, 128, 0.35)";
    ctx.lineWidth = 0.8;
    const gridSpacing = 48;
    const offset = (timeNow / 90) % gridSpacing;
    for (let x = -gridSpacing; x < width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
    }
    for (let y = -gridSpacing; y < height + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.6);
        ctx.lineTo(width, y + offset * 0.6);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFrame(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = colors.ringOutline;
    ctx.strokeRect(32, 32, width - 64, height - 64);
    ctx.restore();
}

function drawHeader(ctx, width, timeNow, systemData) {
    ctx.save();
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(40, 36, width - 80, 68);
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(40, 36, width - 80, 68);

    ctx.font = `700 20px ${fonts.header}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("SYNAPTIC FORGE CONTROL DECK", 64, 70);

    ctx.textAlign = "right";
    ctx.font = `600 12px ${fonts.primary}`;
    const forgeState = systemData.forgeState || "INCUBATING";
    ctx.fillText(`FORGE STATE: ${forgeState}`, width - 64, 60);
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`COHESION ${(systemData.cohesion || 0.81).toFixed(2)} • RESONANCE ${(systemData.resonance || 0.68).toFixed(2)}`, width - 64, 80);

    ctx.globalAlpha = 0.4 + 0.2 * Math.sin(timeNow / 480);
    ctx.strokeStyle = colors.neonCyan;
    ctx.beginPath();
    ctx.moveTo(64, 94);
    ctx.lineTo(width - 64, 94);
    ctx.stroke();
    ctx.restore();
}

function drawForgeCore(ctx, centerX, centerY, scanParams, techParams, timeNow) {
    const coreRadius = Math.min(centerX, centerY) * 0.36;
    const pulse = 0.45 + 0.35 * Math.sin(timeNow / 620) + (scanParams.scanProgress || 0) * 0.2;

    ctx.save();
    ctx.translate(centerX, centerY);

    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGradient.addColorStop(0, colors.forgeCore);
    coreGradient.addColorStop(0.55, colors.forgeHalo);
    coreGradient.addColorStop(1, "rgba(255, 111, 60, 0)");
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * (0.7 + pulse * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = colors.neonAmber;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius * (0.65 + 0.1 * Math.sin(timeNow / 420)), 0, Math.PI * 2);
    ctx.stroke();

    const glyphCount = 8;
    for (let i = 0; i < glyphCount; i++) {
        const angle = (Math.PI * 2 * i) / glyphCount + timeNow / 1200;
        const radius = coreRadius * (0.42 + 0.05 * Math.sin(timeNow / (500 + i * 60)));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = colors.textPrimary;
        ctx.font = `700 12px ${fonts.primary}`;
        ctx.textAlign = "center";
        ctx.fillText("∿", x, y);
    }

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `600 16px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round((techParams.creativeFlux || 0.68) * 100)}%`, 0, 8);
    ctx.restore();
}

function drawOuterRingControls(ctx, centerX, centerY, width, height, techParams, systemData, timeNow) {
    const outerRadius = Math.min(centerX, centerY) * 0.75;
    const segments = 8;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.sin(timeNow / 3400) * 0.05);

    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        const segmentCenter = {
            x: Math.cos(angle) * outerRadius,
            y: Math.sin(angle) * outerRadius,
        };
        drawSliderRail(ctx, segmentCenter.x, segmentCenter.y, angle, techParams, systemData, timeNow, i);
    }

    ctx.restore();
}

function drawSliderRail(ctx, x, y, angle, techParams, systemData, timeNow, index) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    const railLength = 140;
    const progress = 0.4 + 0.4 * Math.sin(timeNow / (600 + index * 110));

    ctx.strokeStyle = colors.ringOutline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-railLength / 2, 0);
    ctx.lineTo(railLength / 2, 0);
    ctx.stroke();

    ctx.strokeStyle = colors.neonCyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-railLength / 2, 0);
    ctx.lineTo(-railLength / 2 + railLength * progress, 0);
    ctx.stroke();

    ctx.fillStyle = colors.neonMagenta;
    ctx.beginPath();
    ctx.arc(-railLength / 2 + railLength * progress, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `600 12px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(`ALLOC ${((techParams.resourceAllocation || 0.6) * 100 + index * 3).toFixed(0)}%`, 0, -18);
    ctx.fillText(systemData.resourceNames ? systemData.resourceNames[index % systemData.resourceNames.length] : `CHANNEL-${index + 1}`, 0, 20);

    ctx.restore();
}

function drawMidRingControls(ctx, centerX, centerY, techParams, systemData, timeNow) {
    const midRadius = Math.min(centerX, centerY) * 0.54;
    const toggles = 6;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.sin(timeNow / 2800) * 0.04);

    for (let i = 0; i < toggles; i++) {
        const angle = (Math.PI * 2 * i) / toggles;
        const radius = midRadius + 18 * Math.sin(timeNow / (800 + i * 70));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const active = (systemData.syncStates && systemData.syncStates[i]) || (i % 2 === 0);
        drawToggleGlyph(ctx, x, y, angle, active, timeNow, i);
    }

    ctx.restore();
}

function drawToggleGlyph(ctx, x, y, angle, active, timeNow, index) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = active ? colors.neonViolet : colors.ringOutline;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(timeNow / (500 + index * 110));
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = active ? colors.neonViolet : colors.panelBg;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.textPrimary;
    ctx.font = `700 12px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(active ? "SYNC" : "IDLE", 0, 4);

    ctx.restore();
}

function drawInnerRingControls(ctx, centerX, centerY, scanParams, techParams, timeNow) {
    const innerRadius = Math.min(centerX, centerY) * 0.32;
    const joysticks = 4;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.cos(timeNow / 1600) * 0.03);

    for (let i = 0; i < joysticks; i++) {
        const angle = (Math.PI * 2 * i) / joysticks;
        const x = Math.cos(angle) * innerRadius;
        const y = Math.sin(angle) * innerRadius;
        drawJoystickCluster(ctx, x, y, angle, scanParams, techParams, timeNow, i);
    }

    ctx.restore();
}

function drawJoystickCluster(ctx, x, y, angle, scanParams, techParams, timeNow, index) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = colors.ringOutline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();

    const stickAngle = (scanParams.joystickVector || 0.5) * Math.PI * 2 + timeNow / (900 + index * 80);
    const stickRadius = 18 + 6 * Math.sin(timeNow / 500 + index);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(stickAngle) * stickRadius, Math.sin(stickAngle) * stickRadius);
    ctx.strokeStyle = colors.neonCyan;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = colors.neonMagenta;
    ctx.beginPath();
    ctx.arc(Math.cos(stickAngle) * stickRadius, Math.sin(stickAngle) * stickRadius, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.textSecondary;
    ctx.font = `600 10px ${fonts.primary}`;
    ctx.textAlign = "center";
    ctx.fillText(`MOD ${index + 1}`, 0, 40);
    ctx.restore();
}

function drawAIStreams(ctx, centerX, centerY, systemData, timeNow) {
    const filaments = systemData.aiStreams || 6;
    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < filaments; i++) {
        const angle = (Math.PI * 2 * i) / filaments + Math.sin(timeNow / 1200 + i) * 0.2;
        ctx.strokeStyle = i % 2 === 0 ? colors.aiFilament : colors.aiFilamentAlt;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.45 + 0.4 * Math.sin(timeNow / (700 + i * 90));
        ctx.beginPath();
        const loops = 40;
        for (let t = 0; t <= loops; t++) {
            const progress = t / loops;
            const radius = Math.min(centerX, centerY) * progress * 0.78;
            const spiralAngle = angle + progress * Math.PI * 1.4;
            const x = Math.cos(spiralAngle) * radius;
            const y = Math.sin(spiralAngle) * radius;
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    ctx.restore();
}

function drawStatusBands(ctx, width, height, timeNow, techParams, systemData) {
    ctx.save();
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(60, height - 120, width - 120, 70);
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(60, height - 120, width - 120, 70);

    ctx.font = `600 12px ${fonts.primary}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";

    const statusItems = [
        `THERM ${(systemData.forgeTemp || 0.73).toFixed(2)}`,
        `SYNCH ${(systemData.syncBias || 0.64).toFixed(2)}`,
        `AI LINK ${(techParams.aiLinkIntegrity || 0.89).toFixed(2)}`,
    ];

    statusItems.forEach((text, index) => {
        ctx.globalAlpha = 0.6 + 0.3 * Math.sin(timeNow / (520 + index * 160));
        ctx.fillText(text, 80, height - 94 + index * 18);
    });

    ctx.textAlign = "right";
    const rightItems = [
        `FORGE FLOW ${(techParams.forgeFlow || 0.77).toFixed(2)}`,
        `IDEA YIELD ${(systemData.ideaYield || 0.58).toFixed(2)}`,
        `GLOVE PROX ${(techParams.handProximity || 0.18).toFixed(2)}`,
    ];
    rightItems.forEach((text, index) => {
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(timeNow / (600 + index * 180));
        ctx.fillText(text, width - 80, height - 94 + index * 18);
    });

    ctx.restore();
}
