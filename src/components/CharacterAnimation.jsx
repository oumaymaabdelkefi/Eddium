import { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';

// ── Player Character ──────────────────────────────────────
export function PlayerCharacter({ state = 'idle', size = 100 }) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceRef  = useRef(null);

  // Start idle bounce on mount
  useEffect(() => {
    startIdleBounce();
    return () => bounceRef.current?.stop();
  }, []);

  function startIdleBounce() {
    bounceRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue:         -8,
          duration:        900,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue:         0,
          duration:        900,
          useNativeDriver: true,
        }),
      ])
    );
    bounceRef.current.start();
  }

  // React to state changes
  useEffect(() => {
    if (state === 'idle') {
      // Resume idle bounce
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
      startIdleBounce();
      return;
    }

    // Stop bounce for non-idle states
    bounceRef.current?.stop();
    bounceAnim.setValue(0);

    if (state === 'attack') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue:         1.5,
          duration:        120,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue:         1,
          duration:        150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1,
          duration:        200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue:         0,
          duration:        150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Auto return to idle handled by parent
      });
    }

    if (state === 'hurt') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue:         0.7,
          duration:        80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1.2,
          duration:        100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1,
          duration:        150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state]);

  const rotate = rotateAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  const emoji =
    state === 'attack' ? '🗡️' :
    state === 'hurt'   ? '😵' :
                         '🧙‍♀️';

  return (
    <Animated.View style={{
      width:          size,
      height:         size,
      alignItems:     'center',
      justifyContent: 'center',
      transform: [
        { translateY: bounceAnim },
        { scale:      scaleAnim  },
        { rotate:     rotate     },
      ],
    }}>
      <Text style={{ fontSize: size * 0.72 }}>{emoji}</Text>
    </Animated.View>
  );
}

// ── Monster Character ─────────────────────────────────────
export function MonsterCharacter({ state = 'idle', size = 100 }) {
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const opacAnim   = useRef(new Animated.Value(1)).current;
  const bounceRef  = useRef(null);

  // Start idle bounce on mount
  useEffect(() => {
    startIdleBounce();
    return () => bounceRef.current?.stop();
  }, []);

  function startIdleBounce() {
    bounceRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue:         -5,
          duration:        700,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue:         0,
          duration:        700,
          useNativeDriver: true,
        }),
      ])
    );
    bounceRef.current.start();
  }

  // React to state changes
  useEffect(() => {
    if (state === 'idle') {
      scaleAnim.setValue(1);
      opacAnim.setValue(1);
      shakeAnim.setValue(0);
      startIdleBounce();
      return;
    }

    bounceRef.current?.stop();
    bounceAnim.setValue(0);

    if (state === 'hurt') {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue:         16,
          duration:        55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue:         -16,
          duration:        55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue:         10,
          duration:        55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue:         -10,
          duration:        55,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue:         0,
          duration:        55,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue:         0.75,
          duration:        80,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1.15,
          duration:        100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1,
          duration:        150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (state === 'attack') {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue:         1.4,
          duration:        150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         1,
          duration:        200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (state === 'death') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue:         0,
          duration:        700,
          useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue:         0,
          duration:        700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state]);

  const emoji =
    state === 'attack' ? '👿' :
    state === 'hurt'   ? '🤕' :
    state === 'death'  ? '💀' :
                         '👹';

  return (
    <Animated.View style={{
      width:          size,
      height:         size,
      alignItems:     'center',
      justifyContent: 'center',
      opacity:        opacAnim,
      transform: [
        { translateY: bounceAnim },
        { translateX: shakeAnim  },
        { scale:      scaleAnim  },
      ],
    }}>
      <Text style={{ fontSize: size * 0.72 }}>{emoji}</Text>
    </Animated.View>
  );
}

// ── Attack Effect ─────────────────────────────────────────
export function AttackEffect({ visible, type = 'correct' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacAnim.setValue(1);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue:         2,
          friction:        3,
          tension:         40,
          useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue:         0,
          duration:        700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={{
      position:       'absolute',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         99,
      opacity:        opacAnim,
      transform:      [{ scale: scaleAnim }],
    }}>
      <Text style={{ fontSize: 36 }}>
        {type === 'correct' ? '💥' : '💢'}
      </Text>
    </Animated.View>
  );
}