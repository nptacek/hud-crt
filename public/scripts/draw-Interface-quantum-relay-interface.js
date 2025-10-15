export const colors = {
    background: "#000408",
    darkBlue: "#001122",
    white: "#ffffff",
    cyan: "#00ffff",
    darkCyan: "#00aacc",
    brightCyan: "#00eeff",
    green: "#00ff88",
    darkGreen: "#008844",
    amber: "#ffaa00",
    red: "#ff3366",
    purple: "#aa00ff",
    hologramBlue: "rgba(0, 200, 255, 0.6)",
    hologramGreen: "rgba(0, 255, 170, 0.5)",
    gridLines: "rgba(0, 150, 200, 0.3)",
    panelBg: "rgba(0, 50, 100, 0.2)",
    warningPulse: "#ff6600",
    dataStream: "#00ffaa",
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
    
    // Background with subtle gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.7);
    bgGradient.addColorStop(0, "#001122");
    bgGradient.addColorStop(0.5, "#000814");
    bgGradient.addColorStop(1, colors.background);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid overlay
    drawGridOverlay(ctx, width, height, timeNow);
    
    // Main border frame
    ctx.strokeStyle = colors.darkCyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Header section
    drawHeader(ctx, width, timeNow);
    
    // Left panel - System diagnostics
    drawLeftPanel(ctx, 20, 80, 200, height - 160, timeNow, techParams);
    
    // Right panel - Signal analysis
    drawRightPanel(ctx, width - 220, 80, 200, height - 160, timeNow, scanParams);
    
    // Center visualization - Quantum sphere with data streams
    drawCentralVisualization(ctx, centerX, centerY, timeNow, scanParams, techParams);
    
    // Bottom panel - Real-time data stream
    drawBottomPanel(ctx, 240, height - 70, width - 480, 50, timeNow, systemData);
    
    // Corner indicators
    drawCornerIndicators(ctx, width, height, timeNow);
    
    // Status bar at very bottom
    drawStatusBar(ctx, width, height, scanParams, techParams);
}

function drawGridOverlay(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = colors.gridLines;
    ctx.lineWidth = 0.5;
    
    const gridSize = 40;
    const offset = (time / 100) % gridSize;
    
    // Vertical lines with parallax effect
    for (let x = -gridSize; x < width + gridSize; x += gridSize) {
        const xPos = x + offset * 0.3;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -gridSize; y < height + gridSize; y += gridSize) {
        const yPos = y + offset * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawHeader(ctx, width, time) {
    // Header background
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(20, 20, width - 40, 50);
    
    // Header text with glow
    ctx.save();
    ctx.textAlign = "center";
    ctx.shadowColor = colors.cyan;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.brightCyan;
    ctx.font = `24px ${fonts.header}`;
    ctx.fillText("QUANTUM RELAY STATION", width / 2, 48);
    ctx.shadowBlur = 0;
    
    // Subtitle
    ctx.fillStyle = colors.green;
    ctx.font = `11px ${fonts.terminal}`;
    const status = Math.sin(time / 2000) > 0 ? "TRANSMITTING" : "RECEIVING";
    ctx.fillText(`◆ INTERDIMENSIONAL BRIDGE ${status} ◆`, width / 2, 62);
    ctx.restore();
}

function drawLeftPanel(ctx, x, y, width, height, time, techParams) {
    // Panel background
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = colors.darkCyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = colors.cyan;
    ctx.font = `12px ${fonts.header}`;
    ctx.fillText("SYSTEM MATRIX", x + 10, y + 20);
    
    // Energy core visualization
    drawEnergyCore(ctx, x + width/2, y + 80, 40, time, techParams.energyLevel);
    
    // System parameters
    ctx.font = `10px ${fonts.terminal}`;
    const params = [
        { label: "QUANTUM FLUX", value: `${(Math.sin(time/3000) * 50 + 50).toFixed(1)}%` },
        { label: "PHASE SHIFT", value: `${((time/1000) % 360).toFixed(0)}°` },
        { label: "ENTANGLEMENT", value: techParams.energyLevel > 50 ? "STABLE" : "DRIFT" },
        { label: "DIMENSION", value: "3.14159" },
        { label: "TEMPORAL SYNC", value: `${(99.5 + Math.random() * 0.5).toFixed(2)}%` },
    ];
    
    params.forEach((param, i) => {
        const yPos = y + 150 + i * 25;
        ctx.fillStyle = colors.darkCyan;
        ctx.fillText(param.label, x + 10, yPos);
        ctx.fillStyle = colors.green;
        ctx.fillText(param.value, x + 120, yPos);
        
        // Progress bar
        const barWidth = 60;
        ctx.strokeStyle = colors.darkCyan;
        ctx.strokeRect(x + 10, yPos + 5, barWidth, 4);
        const fillWidth = Math.random() * barWidth;
        ctx.fillStyle = colors.hologramGreen;
        ctx.fillRect(x + 10, yPos + 5, fillWidth, 4);
    });
    
    // Waveform monitor at bottom
    drawWaveform(ctx, x + 10, y + height - 80, width - 20, 60, time);
}

function drawRightPanel(ctx, x, y, width, height, time, scanParams) {
    // Panel background
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = colors.darkCyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = colors.cyan;
    ctx.font = `12px ${fonts.header}`;
    ctx.fillText("SIGNAL ANALYSIS", x + 10, y + 20);
    
    // Radar sweep
    drawRadarSweep(ctx, x + width/2, y + 80, 45, time);
    
    // Signal metrics
    ctx.font = `10px ${fonts.terminal}`;
    const signals = [
        { label: "CARRIER WAVE", value: "2.4 GHz", status: "LOCK" },
        { label: "BANDWIDTH", value: "∞", status: "OPEN" },
        { label: "LATENCY", value: "0.001ms", status: "OPTIMAL" },
        { label: "PACKET LOSS", value: "0.00%", status: "PERFECT" },
        { label: "ENCRYPTION", value: "RSA-4096", status: "SECURE" },
    ];
    
    signals.forEach((signal, i) => {
        const yPos = y + 150 + i * 25;
        ctx.fillStyle = colors.darkCyan;
        ctx.fillText(signal.label, x + 10, yPos);
        ctx.fillStyle = colors.amber;
        ctx.fillText(signal.value, x + 100, yPos);
        
        // Status indicator
        const statusColor = signal.status === "LOCK" || signal.status === "SECURE" ? colors.green : colors.amber;
        ctx.fillStyle = statusColor;
        ctx.fillRect(x + width - 50, yPos - 8, 3, 10);
        ctx.font = `8px ${fonts.terminal}`;
        ctx.fillText(signal.status, x + width - 44, yPos);
        ctx.font = `10px ${fonts.terminal}`;
    });
    
    // Spectrum analyzer at bottom
    drawSpectrumAnalyzer(ctx, x + 10, y + height - 80, width - 20, 60, time);
}

function drawCentralVisualization(ctx, centerX, centerY, time, scanParams, techParams) {
    const radius = 120;
    
    // Outer ring with rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time / 5000);
    
    // Multiple orbital rings
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2 - i * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius + i * 20, 0, Math.PI * 2);
        ctx.stroke();
        
        // Orbital markers
        for (let j = 0; j < 8; j++) {
            const angle = (Math.PI * 2 / 8) * j + (time / 3000) * (i + 1);
            const x = Math.cos(angle) * (radius + i * 20);
            const y = Math.sin(angle) * (radius + i * 20);
            
            ctx.fillStyle = colors.cyan;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
    
    // Central holographic sphere
    drawHolographicSphere(ctx, centerX, centerY, radius * 0.7, time);
    
    // Data streams
    drawDataStreams(ctx, centerX, centerY, radius, time);
    
    // Central core indicator
    const pulse = Math.sin(time / 500) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0, 255, 200, ${pulse})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Scan progress arc
    const progress = scanParams.scanProgress || 0;
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * progress));
    ctx.stroke();
    
    // Progress text
    ctx.fillStyle = colors.brightCyan;
    ctx.font = `14px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY + radius + 30);
}

function drawHolographicSphere(ctx, x, y, radius, time) {
    ctx.save();
    ctx.translate(x, y);
    
    const rotation = time / 2000;
    
    // Wireframe sphere with perspective
    ctx.strokeStyle = colors.hologramBlue;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.6;
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        const latRad = (lat * Math.PI) / 180;
        const circleRadius = radius * Math.cos(latRad);
        const circleY = radius * Math.sin(latRad);
        
        for (let lon = 0; lon <= 360; lon += 10) {
            const lonRad = (lon * Math.PI) / 180 + rotation;
            const x = circleRadius * Math.cos(lonRad);
            const z = circleRadius * Math.sin(lonRad);
            const perspective = 1 - z / (radius * 3);
            const projX = x * perspective;
            const projY = circleY * perspective;
            
            if (lon === 0) {
                ctx.moveTo(projX, projY);
            } else {
                ctx.lineTo(projX, projY);
            }
        }
        ctx.stroke();
    }
    
    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        const lonRad = (lon * Math.PI) / 180 + rotation;
        
        for (let lat = -90; lat <= 90; lat += 10) {
            const latRad = (lat * Math.PI) / 180;
            const x = radius * Math.cos(latRad) * Math.cos(lonRad);
            const y = radius * Math.sin(latRad);
            const z = radius * Math.cos(latRad) * Math.sin(lonRad);
            const perspective = 1 - z / (radius * 3);
            const projX = x * perspective;
            const projY = y * perspective;
            
            if (lat === -90) {
                ctx.moveTo(projX, projY);
            } else {
                ctx.lineTo(projX, projY);
            }
        }
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawDataStreams(ctx, x, y, radius, time) {
    ctx.save();
    ctx.translate(x, y);
    
    const streamCount = 6;
    for (let i = 0; i < streamCount; i++) {
        const angle = (Math.PI * 2 / streamCount) * i + time / 4000;
        const startX = Math.cos(angle) * (radius * 0.5);
        const startY = Math.sin(angle) * (radius * 0.5);
        const endX = Math.cos(angle) * (radius * 1.5);
        const endY = Math.sin(angle) * (radius * 1.5);
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(0, 255, 170, 0)");
        gradient.addColorStop(0.5, "rgba(0, 255, 170, 0.6)");
        gradient.addColorStop(1, "rgba(0, 255, 170, 0)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Data packets
        const packetPos = ((time / 50) % 100) / 100;
        const packetX = startX + (endX - startX) * packetPos;
        const packetY = startY + (endY - startY) * packetPos;
        
        ctx.fillStyle = colors.dataStream;
        ctx.beginPath();
        ctx.arc(packetX, packetY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawEnergyCore(ctx, x, y, size, time, energy) {
    // Rotating core
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time / 1000);
    
    // Outer ring
    ctx.strokeStyle = colors.hologramBlue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner rotating elements
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size * 0.8, Math.sin(angle) * size * 0.8);
        ctx.stroke();
    }
    
    // Energy level indicator
    const energyRadius = size * (energy / 100) * 0.6;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, energyRadius);
    gradient.addColorStop(0, colors.brightCyan);
    gradient.addColorStop(1, "rgba(0, 255, 200, 0.2)");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, energyRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Energy percentage
    ctx.fillStyle = colors.green;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(energy)}%`, x, y + size + 15);
}

function drawRadarSweep(ctx, x, y, radius, time) {
    // Radar background
    ctx.fillStyle = "rgba(0, 40, 60, 0.3)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Concentric circles
    ctx.strokeStyle = colors.darkCyan;
    ctx.lineWidth = 0.5;
    for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(x - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x, y + radius);
    ctx.stroke();
    
    // Sweep line
    const sweepAngle = (time / 1000) % (Math.PI * 2);
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(sweepAngle) * radius, y + Math.sin(sweepAngle) * radius);
    ctx.stroke();
    
    // Sweep trail
    const gradient = ctx.createLinearGradient(x, y, 
        x + Math.cos(sweepAngle) * radius, 
        y + Math.sin(sweepAngle) * radius);
    gradient.addColorStop(0, "rgba(0, 255, 136, 0)");
    gradient.addColorStop(1, "rgba(0, 255, 136, 0.3)");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, sweepAngle - 0.5, sweepAngle, false);
    ctx.closePath();
    ctx.fill();
    
    // Random blips
    for (let i = 0; i < 3; i++) {
        const blipAngle = (i * 2.5 + time / 2000) % (Math.PI * 2);
        const blipRadius = radius * (0.3 + Math.sin(time / 500 + i) * 0.3);
        const blipX = x + Math.cos(blipAngle) * blipRadius;
        const blipY = y + Math.sin(blipAngle) * blipRadius;
        
        ctx.fillStyle = colors.amber;
        ctx.beginPath();
        ctx.arc(blipX, blipY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawWaveform(ctx, x, y, width, height, time) {
    // Background
    ctx.fillStyle = "rgba(0, 20, 40, 0.5)";
    ctx.fillRect(x, y, width, height);
    
    // Grid
    ctx.strokeStyle = "rgba(0, 100, 150, 0.3)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + height);
        ctx.stroke();
    }
    
    // Waveform
    ctx.strokeStyle = colors.green;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    for (let i = 0; i <= width; i++) {
        const t = (time / 50 + i) / 20;
        const amplitude = Math.sin(t) * Math.cos(t * 2) * Math.sin(t * 0.5) * (height / 3);
        const yPos = y + height / 2 + amplitude;
        
        if (i === 0) {
            ctx.moveTo(x, yPos);
        } else {
            ctx.lineTo(x + i, yPos);
        }
    }
    ctx.stroke();
}

function drawSpectrumAnalyzer(ctx, x, y, width, height, time) {
    // Background
    ctx.fillStyle = "rgba(0, 20, 40, 0.5)";
    ctx.fillRect(x, y, width, height);
    
    const barCount = 20;
    const barWidth = width / barCount - 2;
    
    for (let i = 0; i < barCount; i++) {
        const barHeight = (Math.sin(time / 200 + i * 0.5) + 1) * 0.5 * height * 0.8;
        const barX = x + i * (barWidth + 2);
        const barY = y + height - barHeight;
        
        // Bar gradient
        const gradient = ctx.createLinearGradient(0, barY, 0, y + height);
        gradient.addColorStop(0, colors.cyan);
        gradient.addColorStop(0.5, colors.green);
        gradient.addColorStop(1, colors.darkGreen);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Peak indicator
        ctx.fillStyle = colors.brightCyan;
        ctx.fillRect(barX, barY - 2, barWidth, 2);
    }
}

function drawBottomPanel(ctx, x, y, width, height, time, systemData) {
    // Panel background
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = colors.darkCyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Scrolling data stream
    ctx.save();
    ctx.clip(new Path2D(ctx.rect(x, y, width, height)));
    
    ctx.font = `10px ${fonts.terminal}`;
    const dataLines = [
        "QUANTUM ENTANGLEMENT STABLE",
        "DIMENSIONAL PHASE LOCK ACHIEVED",
        "SUBSPACE FREQUENCY ALIGNED",
        "TEMPORAL VARIANCE: 0.0001%",
        "PARALLEL UNIVERSE DETECTED",
        "SYNCHRONIZATION COMPLETE",
        "INITIATING BRIDGE PROTOCOL",
        "HANDSHAKE VERIFIED",
    ];
    
    const scrollOffset = (time / 100) % (dataLines.length * 15);
    
    dataLines.forEach((line, i) => {
        const yPos = y + 20 + (i * 15) - scrollOffset;
        if (yPos > y && yPos < y + height) {
            ctx.fillStyle = i % 2 === 0 ? colors.green : colors.cyan;
            ctx.fillText(`> ${line}`, x + 10, yPos);
        }
    });
    
    // Duplicate for continuous scroll
    dataLines.forEach((line, i) => {
        const yPos = y + 20 + (i * 15) + (dataLines.length * 15) - scrollOffset;
        if (yPos > y && yPos < y + height) {
            ctx.fillStyle = i % 2 === 0 ? colors.green : colors.cyan;
            ctx.fillText(`> ${line}`, x + 10, yPos);
        }
    });
    
    ctx.restore();
}

function drawCornerIndicators(ctx, width, height, time) {
    const corners = [
        { x: 30, y: 30 },
        { x: width - 30, y: 30 },
        { x: 30, y: height - 30 },
        { x: width - 30, y: height - 30 },
    ];
    
    corners.forEach((corner, i) => {
        ctx.save();
        ctx.translate(corner.x, corner.y);
        
        const pulse = Math.sin(time / 500 + i * Math.PI / 2) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(0, 255, 200, ${pulse})`;
        ctx.lineWidth = 2;
        
        const size = 15;
        ctx.beginPath();
        
        if (i === 0) { // Top-left
            ctx.moveTo(-size, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, -size);
        } else if (i === 1) { // Top-right
            ctx.moveTo(size, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, -size);
        } else if (i === 2) { // Bottom-left
            ctx.moveTo(-size, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, size);
        } else { // Bottom-right
            ctx.moveTo(size, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, size);
        }
        
        ctx.stroke();
        ctx.restore();
    });
}

function drawStatusBar(ctx, width, height, scanParams, techParams) {
    const barY = height - 20;
    
    // Background
    ctx.fillStyle = "rgba(0, 30, 60, 0.8)";
    ctx.fillRect(0, barY, width, 20);
    
    // Status items
    ctx.font = `10px ${fonts.terminal}`;
    
    const items = [
        { label: "STATUS:", value: "ONLINE", color: colors.green },
        { label: "LINK:", value: "ESTABLISHED", color: colors.cyan },
        { label: "SECURITY:", value: "MAXIMUM", color: colors.green },
        { label: "PING:", value: "1ms", color: colors.amber },
        { label: "UPTIME:", value: "∞", color: colors.purple },
    ];
    
    let xPos = 20;
    items.forEach((item, i) => {
        ctx.fillStyle = colors.darkCyan;
        ctx.fillText(item.label, xPos, barY + 14);
        xPos += ctx.measureText(item.label).width + 5;
        
        ctx.fillStyle = item.color;
        ctx.fillText(item.value, xPos, barY + 14);
        xPos += ctx.measureText(item.value).width + 30;
        
        // Separator
        if (i < items.length - 1) {
            ctx.strokeStyle = colors.darkCyan;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xPos - 15, barY + 4);
            ctx.lineTo(xPos - 15, barY + 16);
            ctx.stroke();
        }
    });
    
    // Time display on right
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    ctx.fillStyle = colors.brightCyan;
    ctx.fillText(timeStr, width - 70, barY + 14);
}