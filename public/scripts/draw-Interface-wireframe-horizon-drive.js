export const colors = {
    background: "#000011",
    horizonGlow: "#ff00ff",
    gridNeon: "#00ffff",
    gridFar: "rgba(0, 255, 255, 0.2)",
    gridNear: "rgba(0, 255, 255, 0.9)",
    mountainLine: "#ff00aa",
    structureWire: "#00ff88",
    vehicleTrail: "#ffaa00",
    scanLine: "#00ffff",
    sunGradient1: "#ff0066",
    sunGradient2: "#ffaa00",
    dataStream: "#00ff00",
    speedLine: "rgba(255, 0, 255, 0.6)",
    starField: "#ffffff",
    dashboardText: "#00ffaa",
    warningRed: "#ff0044",
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
    const horizonY = height * 0.4;
    const centerX = width / 2;
    
    // Speed based on params
    const speed = techParams.energyLevel / 10 || 5;
    const scroll = (timeNow * speed / 100) % 1000;
    
    // Clear and set background
    drawBackground(ctx, width, height, horizonY);
    
    // Star field / particle effects in sky
    drawStarField(ctx, width, horizonY, timeNow);
    
    // Retro sun/moon on horizon
    drawRetroSun(ctx, centerX, horizonY, timeNow);
    
    // Mountain range wireframes in background
    drawMountainRange(ctx, width, horizonY, scroll);
    
    // Draw the perspective grid (the "road")
    drawPerspectiveGrid(ctx, width, height, horizonY, scroll);
    
    // Side structures/buildings that zoom past
    drawSideStructures(ctx, width, height, horizonY, scroll);
    
    // Flying objects / obstacles
    drawFlyingObjects(ctx, width, height, horizonY, scroll);
    
    // Speed lines for motion effect
    drawSpeedLines(ctx, width, height, centerX, horizonY, speed);
    
    // HUD overlay
    drawHUD(ctx, width, height, scanParams, techParams, timeNow);
    
    // Dashboard at bottom
    drawDashboard(ctx, width, height, techParams, scanParams, timeNow);
    
    // Scan lines for that CRT feel
    drawScanLines(ctx, width, height, timeNow);
}

function drawBackground(ctx, width, height, horizonY) {
    // Gradient background - dark at top, slightly lighter at horizon
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#000011");
    bgGradient.addColorStop(0.3, "#000033");
    bgGradient.addColorStop(0.4, "#110044");
    bgGradient.addColorStop(0.5, "#220044");
    bgGradient.addColorStop(1, "#000022");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Horizon glow
    const horizonGradient = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 50);
    horizonGradient.addColorStop(0, "rgba(255, 0, 255, 0)");
    horizonGradient.addColorStop(0.5, "rgba(255, 0, 255, 0.2)");
    horizonGradient.addColorStop(1, "rgba(0, 255, 255, 0.1)");
    ctx.fillStyle = horizonGradient;
    ctx.fillRect(0, horizonY - 50, width, 100);
}

function drawStarField(ctx, width, horizonY, time) {
    ctx.save();
    
    // Static stars
    const starPositions = [];
    for (let i = 0; i < 50; i++) {
        starPositions.push({
            x: (i * 137.5) % width, // Golden ratio distribution
            y: (i * 89) % horizonY,
            size: (i % 3) + 1,
            twinkle: i * 0.1
        });
    }
    
    starPositions.forEach(star => {
        const brightness = 0.5 + Math.sin(time / 500 + star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    
    ctx.restore();
}

function drawRetroSun(ctx, centerX, horizonY, time) {
    const sunY = horizonY - 40;
    const sunRadius = 50;
    
    ctx.save();
    
    // Sun gradient
    const sunGradient = ctx.createRadialGradient(centerX, sunY, 0, centerX, sunY, sunRadius);
    sunGradient.addColorStop(0, colors.sunGradient2);
    sunGradient.addColorStop(0.5, colors.sunGradient1);
    sunGradient.addColorStop(1, "rgba(255, 0, 100, 0.3)");
    
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Horizontal scan lines through sun
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    for (let y = sunY - sunRadius; y < sunY + sunRadius; y += 8) {
        const lineWidth = Math.sqrt(sunRadius * sunRadius - (y - sunY) * (y - sunY)) * 2;
        ctx.beginPath();
        ctx.moveTo(centerX - lineWidth/2, y);
        ctx.lineTo(centerX + lineWidth/2, y);
        ctx.stroke();
    }
    
    // Sun reflection on horizon
    const reflectionGradient = ctx.createLinearGradient(0, horizonY, 0, horizonY + 30);
    reflectionGradient.addColorStop(0, "rgba(255, 0, 150, 0.3)");
    reflectionGradient.addColorStop(1, "rgba(255, 0, 150, 0)");
    ctx.fillStyle = reflectionGradient;
    ctx.fillRect(centerX - sunRadius, horizonY, sunRadius * 2, 30);
    
    ctx.restore();
}

function drawMountainRange(ctx, width, horizonY, scroll) {
    ctx.save();
    ctx.strokeStyle = colors.mountainLine;
    ctx.lineWidth = 1.5;
    
    // Multiple mountain layers for depth
    const layers = [
        { peaks: 5, height: 80, speed: 0.1, alpha: 0.3 },
        { peaks: 7, height: 60, speed: 0.2, alpha: 0.5 },
        { peaks: 9, height: 40, speed: 0.3, alpha: 0.7 },
    ];
    
    layers.forEach(layer => {
        ctx.globalAlpha = layer.alpha;
        ctx.beginPath();
        
        for (let x = -100; x <= width + 100; x += 5) {
            const xOffset = (x + scroll * layer.speed) % width;
            let y = horizonY;
            
            for (let p = 0; p < layer.peaks; p++) {
                const peakX = (width / layer.peaks) * p;
                const distance = Math.abs(xOffset - peakX);
                const peakInfluence = Math.max(0, 1 - distance / (width / layer.peaks));
                y -= Math.sin(peakInfluence * Math.PI) * layer.height;
            }
            
            if (x === -100) {
                ctx.moveTo(xOffset, y);
            } else {
                ctx.lineTo(xOffset, y);
            }
        }
        
        ctx.stroke();
    });
    
    ctx.restore();
}

function drawPerspectiveGrid(ctx, width, height, horizonY, scroll) {
    ctx.save();
    
    const vanishingPointY = horizonY;
    const roadWidth = width * 0.8;
    const roadLeft = (width - roadWidth) / 2;
    const roadRight = roadLeft + roadWidth;
    
    // Vertical grid lines (perpendicular to road)
    const lineCount = 20;
    for (let i = 0; i < lineCount; i++) {
        const depth = i / lineCount;
        const y = horizonY + (height - horizonY) * Math.pow(depth, 0.5);
        const lineScroll = (scroll * Math.pow(depth + 0.1, 2)) % 40;
        
        if ((i + Math.floor(lineScroll / 4)) % 4 === 0) {
            // Calculate perspective width at this depth
            const perspectiveScale = depth;
            const leftX = centerX - (centerX - roadLeft) * perspectiveScale;
            const rightX = centerX + (roadRight - centerX) * perspectiveScale;
            
            // Fade based on distance
            const alpha = 0.2 + depth * 0.7;
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5 + depth * 2;
            
            ctx.beginPath();
            ctx.moveTo(leftX, y);
            ctx.lineTo(rightX, y);
            ctx.stroke();
        }
    }
    
    // Perspective lines (road edges and center)
    const perspectiveLines = [
        { startX: roadLeft, color: colors.gridNeon },
        { startX: roadLeft + roadWidth * 0.33, color: "rgba(0, 255, 255, 0.3)" },
        { startX: centerX, color: "rgba(255, 0, 255, 0.5)" },
        { startX: roadRight - roadWidth * 0.33, color: "rgba(0, 255, 255, 0.3)" },
        { startX: roadRight, color: colors.gridNeon },
    ];
    
    perspectiveLines.forEach((line, index) => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = index === 0 || index === 4 ? 2 : 1;
        
        // Dashed center line
        if (index === 2) {
            ctx.setLineDash([20, 20]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(line.startX, height);
        ctx.lineTo(centerX, vanishingPointY);
        ctx.stroke();
    });
    
    ctx.setLineDash([]);
    ctx.restore();
}

function drawSideStructures(ctx, width, height, horizonY, scroll) {
    ctx.save();
    
    // Structures/buildings on the sides
    const structures = [];
    for (let i = 0; i < 8; i++) {
        structures.push({
            side: i % 2 === 0 ? 'left' : 'right',
            distance: (i * 0.15) % 1,
            height: 50 + (i * 30) % 100,
            width: 30 + (i * 20) % 40,
            offset: i * 200
        });
    }
    
    structures.forEach(struct => {
        // Calculate position based on distance (0 = horizon, 1 = viewer)
        const scrolledDistance = (struct.distance + scroll / 1000) % 1;
        
        if (scrolledDistance > 0.1) { // Don't draw if too close/passed
            const y = horizonY + (height - horizonY) * scrolledDistance;
            const scale = scrolledDistance;
            const structHeight = struct.height * scale;
            const structWidth = struct.width * scale;
            
            let x;
            if (struct.side === 'left') {
                x = 50 * (1 - scrolledDistance) + 150 * scrolledDistance;
            } else {
                x = (width - 50) * (1 - scrolledDistance) + (width - 150) * scrolledDistance;
            }
            
            // Draw wireframe structure
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 + scrolledDistance * 0.7})`;
            ctx.lineWidth = 0.5 + scrolledDistance;
            
            // Base rectangle
            ctx.strokeRect(x - structWidth/2, y - structHeight, structWidth, structHeight);
            
            // Cross beams
            ctx.beginPath();
            ctx.moveTo(x - structWidth/2, y - structHeight);
            ctx.lineTo(x + structWidth/2, y);
            ctx.moveTo(x + structWidth/2, y - structHeight);
            ctx.lineTo(x - structWidth/2, y);
            ctx.stroke();
            
            // Vertical divisions
            for (let div = 1; div < 4; div++) {
                ctx.beginPath();
                ctx.moveTo(x - structWidth/2 + (structWidth/4) * div, y - structHeight);
                ctx.lineTo(x - structWidth/2 + (structWidth/4) * div, y);
                ctx.stroke();
            }
        }
    });
    
    ctx.restore();
}

function drawFlyingObjects(ctx, width, height, horizonY, scroll) {
    ctx.save();
    
    // Flying triangular objects
    const objects = [];
    for (let i = 0; i < 5; i++) {
        objects.push({
            x: width * 0.2 + (i * width * 0.15),
            startDistance: (i * 0.25) % 1,
            size: 10 + i * 5,
            yOffset: -20 - i * 10
        });
    }
    
    objects.forEach(obj => {
        const distance = (obj.startDistance + scroll / 500) % 1.2;
        
        if (distance > 0.1 && distance < 1) {
            const y = horizonY + (height - horizonY) * distance * 0.5 + obj.yOffset;
            const scale = distance;
            const size = obj.size * scale;
            
            // Oscillating X movement
            const xOscillation = Math.sin(scroll / 100 + obj.startDistance * Math.PI * 2) * 50;
            const x = obj.x + xOscillation;
            
            // Draw triangular ship
            ctx.strokeStyle = `rgba(255, 170, 0, ${0.4 + distance * 0.6})`;
            ctx.lineWidth = 1 + distance;
            
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x - size/2, y + size/2);
            ctx.lineTo(x + size/2, y + size/2);
            ctx.closePath();
            ctx.stroke();
            
            // Inner detail
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - size/4, y + size/4);
            ctx.lineTo(x + size/4, y + size/4);
            ctx.closePath();
            ctx.stroke();
        }
    });
    
    ctx.restore();
}

function drawSpeedLines(ctx, width, height, centerX, horizonY, speed) {
    ctx.save();
    
    const lineCount = Math.floor(speed * 2);
    
    for (let i = 0; i < lineCount; i++) {
        const angle = (Math.PI * 2 / lineCount) * i;
        const startRadius = 50;
        const endRadius = Math.max(width, height);
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = horizonY + Math.sin(angle) * startRadius * 0.3;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = horizonY + Math.sin(angle) * endRadius * 0.3;
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, "rgba(255, 0, 255, 0)");
        gradient.addColorStop(0.5, "rgba(255, 0, 255, 0.1)");
        gradient.addColorStop(1, "rgba(255, 0, 255, 0)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawHUD(ctx, width, height, scanParams, techParams, time) {
    ctx.save();
    
    // Targeting reticle in center
    const centerX = width / 2;
    const centerY = height / 2;
    const reticleSize = 50;
    
    ctx.strokeStyle = colors.scanLine;
    ctx.lineWidth = 1;
    
    // Rotating reticle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time / 1000);
    
    // Outer square
    ctx.strokeRect(-reticleSize/2, -reticleSize/2, reticleSize, reticleSize);
    
    // Inner cross
    ctx.beginPath();
    ctx.moveTo(-reticleSize/2, 0);
    ctx.lineTo(reticleSize/2, 0);
    ctx.moveTo(0, -reticleSize/2);
    ctx.lineTo(0, reticleSize/2);
    ctx.stroke();
    
    // Corner brackets
    const bracketSize = 10;
    const corners = [
        [-reticleSize/2, -reticleSize/2],
        [reticleSize/2, -reticleSize/2],
        [-reticleSize/2, reticleSize/2],
        [reticleSize/2, reticleSize/2]
    ];
    
    corners.forEach(([x, y]) => {
        ctx.beginPath();
        if (x < 0 && y < 0) { // Top-left
            ctx.moveTo(x, y + bracketSize);
            ctx.lineTo(x, y);
            ctx.lineTo(x + bracketSize, y);
        } else if (x > 0 && y < 0) { // Top-right
            ctx.moveTo(x - bracketSize, y);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + bracketSize);
        } else if (x < 0 && y > 0) { // Bottom-left
            ctx.moveTo(x, y - bracketSize);
            ctx.lineTo(x, y);
            ctx.lineTo(x + bracketSize, y);
        } else { // Bottom-right
            ctx.moveTo(x - bracketSize, y);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y - bracketSize);
        }
        ctx.stroke();
    });
    
    ctx.restore();
    
    // Distance markers on sides
    for (let i = 0; i < 5; i++) {
        const y = height * 0.3 + (height * 0.5 / 5) * i;
        const distance = 100 - i * 20;
        
        // Left side
        ctx.strokeStyle = colors.dashboardText;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(40, y);
        ctx.stroke();
        
        ctx.fillStyle = colors.dashboardText;
        ctx.font = `10px ${fonts.terminal}`;
        ctx.fillText(`${distance}m`, 45, y + 3);
        
        // Right side
        ctx.beginPath();
        ctx.moveTo(width - 20, y);
        ctx.lineTo(width - 40, y);
        ctx.stroke();
        
        ctx.fillText(`${distance}m`, width - 75, y + 3);
    }
    
    ctx.restore();
}

function drawDashboard(ctx, width, height, techParams, scanParams, time) {
    const dashHeight = 120;
    const dashY = height - dashHeight;
    
    // Dashboard background with gradient
    const dashGradient = ctx.createLinearGradient(0, dashY, 0, height);
    dashGradient.addColorStop(0, "rgba(0, 20, 40, 0.8)");
    dashGradient.addColorStop(1, "rgba(0, 40, 80, 0.9)");
    ctx.fillStyle = dashGradient;
    ctx.fillRect(0, dashY, width, dashHeight);
    
    // Top border of dashboard
    ctx.strokeStyle = colors.gridNeon;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, dashY);
    ctx.lineTo(width, dashY);
    ctx.stroke();
    
    // Speed gauge (left)
    drawSpeedGauge(ctx, 100, dashY + 60, 50, techParams.energyLevel, time);
    
    // RPM gauge (left-center)
    drawRPMGauge(ctx, 250, dashY + 60, 50, time);
    
    // Waveform display (center)
    drawWaveformDisplay(ctx, 380, dashY + 20, 200, 80, time);
    
    // System status (right-center)
    drawSystemStatus(ctx, 620, dashY + 25, scanParams, techParams, time);
    
    // Mini radar (right)
    drawMiniRadar(ctx, width - 100, dashY + 60, 40, time);
    
    // Digital readouts at bottom
    ctx.fillStyle = colors.dashboardText;
    ctx.font = `12px ${fonts.display}`;
    ctx.fillText("VELOCITY", 50, height - 10);
    ctx.fillText(`${Math.round(techParams.energyLevel * 2.5)} KM/H`, 50, height - 25);
    
    ctx.fillText("ALTITUDE", 200, height - 10);
    ctx.fillText(`${Math.round(150 + Math.sin(time / 2000) * 20)} M`, 200, height - 25);
    
    ctx.fillText("DISTANCE", 350, height - 10);
    ctx.fillText(`${Math.round(time / 100 % 9999)} KM`, 350, height - 25);
    
    ctx.fillText("SCAN", 500, height - 10);
    ctx.fillText(`${Math.round(scanParams.scanProgress * 100)}%`, 500, height - 25);
    
    // Time
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    ctx.fillStyle = colors.gridNeon;
    ctx.font = `16px ${fonts.display}`;
    ctx.fillText(timeStr, width - 100, height - 15);
}

function drawSpeedGauge(ctx, x, y, radius, speed, time) {
    // Gauge background
    ctx.strokeStyle = colors.gridFar;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 0.7, Math.PI * 2.3);
    ctx.stroke();
    
    // Speed arc
    const speedAngle = Math.PI * 0.7 + (Math.PI * 1.6) * (speed / 100);
    ctx.strokeStyle = colors.gridNeon;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 0.7, speedAngle);
    ctx.stroke();
    
    // Needle
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(speedAngle - Math.PI / 2);
    ctx.strokeStyle = colors.warningRed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.8);
    ctx.stroke();
    ctx.restore();
    
    // Center dot
    ctx.fillStyle = colors.gridNeon;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = colors.dashboardText;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText("SPEED", x, y + radius + 15);
}

function drawRPMGauge(ctx, x, y, radius, time) {
    const rpm = 3000 + Math.sin(time / 500) * 1500;
    
    // Gauge background
    ctx.strokeStyle = colors.gridFar;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 0.7, Math.PI * 2.3);
    ctx.stroke();
    
    // RPM arc
    const rpmAngle = Math.PI * 0.7 + (Math.PI * 1.6) * (rpm / 8000);
    ctx.strokeStyle = rpm > 6000 ? colors.warningRed : colors.structureWire;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 0.7, rpmAngle);
    ctx.stroke();
    
    // Ticks
    for (let i = 0; i <= 8; i++) {
        const tickAngle = Math.PI * 0.7 + (Math.PI * 1.6) * (i / 8);
        const innerRadius = radius - 5;
        const outerRadius = radius - 2;
        
        ctx.strokeStyle = colors.gridFar;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(tickAngle) * innerRadius, y + Math.sin(tickAngle) * innerRadius);
        ctx.lineTo(x + Math.cos(tickAngle) * outerRadius, y + Math.sin(tickAngle) * outerRadius);
        ctx.stroke();
    }
    
    // Center
    ctx.fillStyle = colors.structureWire;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = colors.dashboardText;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText("RPM x1000", x, y + radius + 15);
}

function drawWaveformDisplay(ctx, x, y, width, height, time) {
    // Display frame
    ctx.strokeStyle = colors.gridNeon;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Background
    ctx.fillStyle = "rgba(0, 20, 40, 0.5)";
    ctx.fillRect(x, y, width, height);
    
    // Grid
    ctx.strokeStyle = colors.gridFar;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const lineX = x + (width / 4) * i;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= 2; i++) {
        const lineY = y + (height / 2) * i;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + width, lineY);
        ctx.stroke();
    }
    
    // Waveform
    ctx.strokeStyle = colors.dataStream;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i <= width; i++) {
        const t = (time / 50 + i) / 20;
        const wave1 = Math.sin(t) * 20;
        const wave2 = Math.sin(t * 2.3) * 10;
        const wave3 = Math.sin(t * 7) * 5;
        const waveY = y + height/2 + wave1 + wave2 + wave3;
        
        if (i === 0) {
            ctx.moveTo(x, waveY);
        } else {
            ctx.lineTo(x + i, waveY);
        }
    }
    ctx.stroke();
    
    // Label
    ctx.fillStyle = colors.dashboardText;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText("WAVEFORM", x + width/2, y - 5);
}

function drawSystemStatus(ctx, x, y, scanParams, techParams, time) {
    const systems = [
        { name: "ENGINE", status: "ONLINE", color: colors.structureWire },
        { name: "SHIELDS", status: `${Math.round(90 + Math.sin(time/1000) * 10)}%`, color: colors.gridNeon },
        { name: "WEAPONS", status: "ARMED", color: colors.vehicleTrail },
        { name: "SCANNER", status: scanParams.scanProgress > 0.5 ? "ACTIVE" : "IDLE", color: colors.dataStream },
        { name: "TURBO", status: techParams.energyLevel > 70 ? "ENGAGED" : "READY", color: colors.warningRed }
    ];
    
    ctx.font = `10px ${fonts.terminal}`;
    systems.forEach((sys, i) => {
        const sysY = y + i * 15;
        
        // Status indicator light
        const isActive = sys.status !== "IDLE" && sys.status !== "READY";
        ctx.fillStyle = isActive ? sys.color : colors.gridFar;
        ctx.fillRect(x, sysY - 5, 5, 8);
        
        // System name
        ctx.fillStyle = colors.dashboardText;
        ctx.fillText(sys.name, x + 10, sysY);
        
        // Status
        ctx.fillStyle = sys.color;
        ctx.fillText(sys.status, x + 80, sysY);
    });
}

function drawMiniRadar(ctx, x, y, radius, time) {
    // Radar background
    ctx.fillStyle = "rgba(0, 40, 60, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Radar circles
    ctx.strokeStyle = colors.gridFar;
    ctx.lineWidth = 0.5;
    for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Cross
    ctx.beginPath();
    ctx.moveTo(x - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x, y + radius);
    ctx.stroke();
    
    // Sweep
    const sweepAngle = (time / 500) % (Math.PI * 2);
    const sweepGradient = ctx.createLinearGradient(x, y, 
        x + Math.cos(sweepAngle) * radius,
        y + Math.sin(sweepAngle) * radius);
    sweepGradient.addColorStop(0, "rgba(0, 255, 136, 0)");
    sweepGradient.addColorStop(1, "rgba(0, 255, 136, 0.4)");
    
    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, sweepAngle - 0.3, sweepAngle, false);
    ctx.closePath();
    ctx.fill();
    
    // Blips
    for (let i = 0; i < 3; i++) {
        const blipAngle = (i * 2.1 + time / 1000) % (Math.PI * 2);
        const blipRadius = radius * 0.6;
        const blipX = x + Math.cos(blipAngle) * blipRadius;
        const blipY = y + Math.sin(blipAngle) * blipRadius;
        
        ctx.fillStyle = colors.vehicleTrail;
        ctx.fillRect(blipX - 1, blipY - 1, 2, 2);
    }
    
    // Label
    ctx.fillStyle = colors.dashboardText;
    ctx.font = `10px ${fonts.terminal}`;
    ctx.textAlign = "center";
    ctx.fillText("RADAR", x, y + radius + 15);
}

function drawScanLines(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    
    // Horizontal scan lines for CRT effect
    for (let y = 0; y < height; y += 2) {
        if (y % 4 === 0) {
            ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
            ctx.fillRect(0, y, width, 1);
        }
    }
    
    // Moving scan bar
    const scanY = (time / 10) % height;
    const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    scanGradient.addColorStop(0, "rgba(0, 255, 255, 0)");
    scanGradient.addColorStop(0.5, "rgba(0, 255, 255, 0.2)");
    scanGradient.addColorStop(1, "rgba(0, 255, 255, 0)");
    
    ctx.fillStyle = scanGradient;
    ctx.fillRect(0, scanY - 20, width, 40);
    
    ctx.restore();
}