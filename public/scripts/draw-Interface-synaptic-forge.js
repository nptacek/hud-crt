export const colors = {
    background: "#0a0416",
    gradientInner: "#2a0c3f",
    gradientOuter: "#080213",
    ringOuter: "rgba(255, 102, 204, 0.38)",
    ringMid: "rgba(74, 255, 242, 0.35)",
    ringInner: "rgba(255, 246, 140, 0.35)",
    forgeCore: "#ff6f5e",
    forgeCoreGlow: "rgba(255, 120, 90, 0.4)",
    filament: "rgba(90, 255, 230, 0.75)",
    filamentAlt: "rgba(255, 96, 241, 0.72)",
    textPrimary: "#f6efff",
    textSecondary: "rgba(246, 239, 255, 0.6)",
    textAccent: "#ffe080",
    gaugeTrack: "rgba(20, 20, 40, 0.6)",
    gaugeFill: "rgba(255, 96, 241, 0.6)",
    gaugeFillAlt: "rgba(74, 255, 242, 0.6)",
    controlBg: "rgba(34, 10, 52, 0.75)",
    controlBorder: "rgba(255, 96, 241, 0.45)",
    controlGlow: "rgba(74, 255, 242, 0.55)",
    scanline: "rgba(255, 96, 241, 0.07)",
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
    const centerX = width / 2;
    const centerY = height / 2;

    drawBackground(ctx, width, height);
    drawConcentricRings(ctx, centerX, centerY, width, height, timeNow);
    drawForgeCore(ctx, centerX, centerY, timeNow, systemData);
    drawRingControls(ctx, centerX, centerY, width, height, timeNow, techParams, scanParams);
    drawFilamentStreams(ctx, centerX, centerY, timeNow, systemData);
    drawHeader(ctx, width, timeNow, systemData);
    drawCornerTelemetry(ctx, width, height, timeNow, chromaticParams);
    drawScanlines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height) {
    const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
    );
    gradient.addColorStop(0, colors.gradientInner);
    gradient.addColorStop(0.5, "#120628");
    gradient.addColorStop(1, colors.gradientOuter);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function drawConcentricRings(ctx, centerX, centerY, width, height, time) {
    ctx.save();
    const maxRadius = Math.min(width, height) * 0.45;
    const rings = [
        { radius: maxRadius, color: colors.ringOuter, lineWidth: 4 },
        { radius: maxRadius * 0.74, color: colors.ringMid, lineWidth: 3 },
        { radius: maxRadius * 0.5, color: colors.ringInner, lineWidth: 3 },
    ];

    rings.forEach((ring, index) => {
        ctx.globalAlpha = 0.4 + 0.2 * Math.sin(time / 2000 + index);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.lineWidth;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        drawRingSegments(ctx, centerX, centerY, ring.radius, index, time);
    });
    ctx.restore();
}

function drawRingSegments(ctx, centerX, centerY, radius, ringIndex, time) {
    const segmentCount = 12;
    ctx.save();
    ctx.translate(centerX, centerY);
    const rotation = time / (2000 - ringIndex * 300);
    ctx.rotate(rotation * (ringIndex % 2 === 0 ? 1 : -1));

    for (let i = 0; i < segmentCount; i++) {
        ctx.save();
        ctx.rotate((i / segmentCount) * Math.PI * 2);
        ctx.beginPath();
        ctx.strokeStyle = ringIndex % 2 === 0 ? colors.controlGlow : colors.controlBorder;
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(time / 1200 + i);
        ctx.lineWidth = 2;
        ctx.moveTo(radius - 16, 0);
        ctx.lineTo(radius, 0);
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}

function drawForgeCore(ctx, centerX, centerY, time, systemData) {
    ctx.save();
    const corePulse = Math.sin(time / 260) * 0.2 + 1;
    const coreRadius = 46 + (systemData?.coreIntensity || 0.2) * 26 * corePulse;

    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2);
    glow.addColorStop(0, colors.forgeCoreGlow);
    glow.addColorStop(1, "rgba(255, 120, 90, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, "#ffd3b6");
    coreGradient.addColorStop(0.6, colors.forgeCore);
    coreGradient.addColorStop(1, "#a51378");

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.textAccent;
    ctx.font = `16px ${fonts.header}`;
    ctx.textAlign = "center";
    ctx.fillText("SYNAPTIC FORGE", centerX, centerY + coreRadius + 24);

    const metrics = systemData?.forgeMetrics || ["IDEA PRESSURE", "CO-FOCUS", "MUSE LINK"];
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `10px ${fonts.terminal}`;
    metrics.forEach((metric, index) => {
        ctx.fillText(metric, centerX, centerY + coreRadius + 40 + index * 16);
    });
    ctx.restore();
}

function drawRingControls(ctx, centerX, centerY, width, height, time, techParams, scanParams) {
    const outerRadius = Math.min(width, height) * 0.45;
    const midRadius = outerRadius * 0.74;
    const innerRadius = outerRadius * 0.5;

    drawSliderRail(ctx, centerX, centerY, outerRadius, time, techParams);
    drawToggleGlyphs(ctx, centerX, centerY, midRadius, time, techParams);
    drawJoystickCluster(ctx, centerX, centerY, innerRadius, time, scanParams);
}

function drawSliderRail(ctx, centerX, centerY, radius, time, techParams) {
    ctx.save();
    ctx.translate(centerX, centerY);
    const sliders = 8;
    const values = techParams?.resourceBands || new Array(sliders).fill(0).map((_, i) => 0.4 + 0.4 * Math.sin(time / 1500 + i));

    for (let i = 0; i < sliders; i++) {
        const angle = (i / sliders) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(radius - 20, 0);
        ctx.fillStyle = colors.controlBg;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-12, -40, 24, 80);

        ctx.strokeStyle = colors.controlBorder;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-12, -40, 24, 80);

        const value = Math.max(0, Math.min(1, values[i]));
        ctx.fillStyle = colors.gaugeFill;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-6, 36 - value * 72, 12, value * 72);

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `8px ${fonts.terminal}`;
        ctx.rotate(-angle);
        ctx.fillText(`R${i + 1}`, 0, -48);
        ctx.restore();
    }
    ctx.restore();
}

function drawToggleGlyphs(ctx, centerX, centerY, radius, time, techParams) {
    ctx.save();
    ctx.translate(centerX, centerY);
    const toggles = techParams?.syncNodes || [
        { label: "SYNC", active: true },
        { label: "LOOP", active: false },
        { label: "MIRR", active: true },
        { label: "PUSH", active: false },
        { label: "NOVA", active: true },
        { label: "TRACE", active: false },
    ];

    toggles.forEach((toggle, index) => {
        const angle = (index / toggles.length) * Math.PI * 2 + time / 2400;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.fillStyle = toggle.active ? colors.gaugeFillAlt : colors.controlBg;
        ctx.globalAlpha = toggle.active ? 0.9 : 0.6;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors.controlBorder;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `10px ${fonts.header}`;
        ctx.textAlign = "center";
        ctx.fillText(toggle.label, x, y + 4);
    });
    ctx.restore();
}

function drawJoystickCluster(ctx, centerX, centerY, radius, time, scanParams) {
    ctx.save();
    ctx.translate(centerX, centerY);
    const joysticks = 3;
    const vector = scanParams?.vector || { x: 0.2, y: -0.4 };

    for (let i = 0; i < joysticks; i++) {
        const angle = (i / joysticks) * Math.PI * 2 + time / 1600;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        ctx.strokeStyle = colors.controlGlow;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 32, 0, Math.PI * 2);
        ctx.stroke();

        const handleX = x + vector.x * 14;
        const handleY = y + vector.y * 14 + Math.sin(time / 300 + i) * 3;
        ctx.fillStyle = colors.gaugeFill;
        ctx.beginPath();
        ctx.arc(handleX, handleY, 9, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawFilamentStreams(ctx, centerX, centerY, time, systemData) {
    ctx.save();
    const filaments = systemData?.aiFilaments || 10;
    for (let i = 0; i < filaments; i++) {
        const angle = (i / filaments) * Math.PI * 2 + Math.sin(time / 1800 + i);
        const radius = 220 + Math.sin(time / 900 + i) * 40;
        const points = 32;

        ctx.beginPath();
        for (let p = 0; p <= points; p++) {
            const t = p / points;
            const curveAngle = angle + Math.sin(time / 1200 + p) * 0.2 * (1 - t);
            const r = radius * (1 - t * 0.7);
            const x = centerX + Math.cos(curveAngle) * r * (1 - t * 0.2);
            const y = centerY + Math.sin(curveAngle) * r * (1 - t * 0.2);
            if (p === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        const gradient = ctx.createLinearGradient(centerX, centerY, centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        gradient.addColorStop(0, colors.filament);
        gradient.addColorStop(1, colors.filamentAlt);
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time / 1000 + i);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
}

function drawHeader(ctx, width, time, systemData) {
    ctx.save();
    ctx.fillStyle = colors.controlBg;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(50, 26, width - 100, 70);

    ctx.strokeStyle = colors.controlBorder;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 1;
    ctx.strokeRect(50, 26, width - 100, 70);

    ctx.font = `24px ${fonts.header}`;
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = "center";
    ctx.fillText("SYNAPTIC FORGE CONTROL DECK", width / 2, 60);

    ctx.font = `11px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    const mode = systemData?.forgeMode || "SCULPT";
    ctx.fillText(`MODE ${mode} • FEEDBACK ${(Math.sin(time / 1800) * 0.5 + 0.5).toFixed(2)}`, width / 2, 82);
    ctx.restore();
}

function drawCornerTelemetry(ctx, width, height, time, chromaticParams) {
    ctx.save();
    ctx.fillStyle = colors.controlBg;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(40, height - 80, 180, 56);
    ctx.fillRect(width - 220, height - 80, 180, 56);

    ctx.strokeStyle = colors.controlBorder;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 1;
    ctx.strokeRect(40, height - 80, 180, 56);
    ctx.strokeRect(width - 220, height - 80, 180, 56);

    ctx.font = `10px ${fonts.terminal}`;
    ctx.fillStyle = colors.textSecondary;
    ctx.textAlign = "left";
    ctx.fillText(`GRAIN ${(chromaticParams?.grain || 0).toFixed(2)}`, 54, height - 58);
    ctx.fillText(`LAT ${(Math.sin(time / 1200) * 9 + 22).toFixed(1)}ms`, 54, height - 40);

    ctx.textAlign = "right";
    ctx.fillText(`AMPLITUDE ${(Math.cos(time / 900) * 0.4 + 0.6).toFixed(2)}`, width - 54, height - 58);
    ctx.fillText(`AI CO-OP ${(systemData?.aiCoherence || 0.72).toFixed(2)}`, width - 54, height - 40);
    ctx.restore();
}

function drawScanlines(ctx, width, height, time) {
    ctx.save();
    ctx.fillStyle = colors.scanline;
    const offset = (time / 50) % 5;
    for (let y = 0; y < height; y += 5) {
        ctx.fillRect(0, y + offset, width, 2);
    }
    ctx.restore();
}
