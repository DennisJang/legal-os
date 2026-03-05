import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Modal, Pressable, Alert, Dimensions, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AppleButton from './AppleButton';

const { width, height } = Dimensions.get('window');

export default function ContractScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // 🛡️ [관제탑 패치] 권한 객체가 로딩 중일 때 하얀 화면(크래시) 방어
  if (!permission) return <View style={s.root} />;

  const shoot = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) setPreview(photo.uri);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.85,
    });
    if (!result.canceled) setPreview(result.assets[0].uri);
  };

  // 권한 거부 시 가드 화면
  if (!permission.granted) return (
    <SafeAreaView style={s.guard}>
      <Text style={s.guardTitle}>카메라 권한이 필요합니다</Text>
      <Text style={s.guardBody}>앱 사용을 위해 기기 설정에서 카메라 권한을 허용해주세요.</Text>
      <AppleButton label="권한 요청" onPress={requestPermission} style={{ marginTop: 24, width: 200 }} />
    </SafeAreaView>
  );

  return (
    <View style={s.root}>
      <CameraView ref={cameraRef} style={s.camera} facing="back" />

      {/* 뷰파인더 오버레이 */}
      <View style={s.overlay}>
        <View style={s.frame} />
        <Text style={s.hint}>계약서를 프레임 안에 맞춰주세요</Text>
      </View>

      {/* 컨트롤 패널 (SafeAreaView 방어) */}
      <SafeAreaView style={s.controlsContainer}>
        <View style={s.controls}>
          <Pressable onPress={pickFromGallery} style={s.galleryBtn}>
            <Text style={s.galleryLabel}>앨범</Text>
          </Pressable>
          <Pressable onPress={shoot} style={s.shutter}>
            <View style={s.shutterInner} />
          </Pressable>
          <View style={{ width: 56 }} />
        </View>
      </SafeAreaView>

      {/* 미리보기 모달 바텀시트 */}
      <Modal visible={!!preview} transparent animationType="slide">
        <View style={s.modalBg}>
          <SafeAreaView style={s.modalCard}>
            {preview && <Image source={{ uri: preview }} style={s.thumb} resizeMode="contain" />}
            <Text style={s.modalTitle}>이 이미지를 분석할까요?</Text>
            <AppleButton label="계약서 분석 시작" onPress={() => { Alert.alert('성공', '이미지 스캔 완료 (Domain C 전송 대기)'); setPreview(null); }} />
            <Pressable onPress={() => setPreview(null)} style={{ marginTop: 16, padding: 12 }}>
              <Text style={s.retake}>다시 촬영</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#000' },
  camera:      { flex: 1 },
  overlay:     { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame:       { width: width * 0.85, height: height * 0.55, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  hint:        { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 16, letterSpacing: 0 },
  controlsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  controls:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 24 },
  shutter:     { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  shutterInner:{ width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFFFFF' },
  galleryBtn:  { width: 56, height: 56, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  galleryLabel:{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  modalBg:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:   { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  thumb:       { width: '100%', height: 300, borderRadius: 18, marginBottom: 16 },
  modalTitle:  { fontSize: 17, fontWeight: '600', color: '#1D1D1F', letterSpacing: -0.374, marginBottom: 16, textAlign: 'center' },
  retake:      { textAlign: 'center', color: '#0071E3', fontSize: 17, fontWeight: '400' },
  guard:       { flex: 1, backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center', padding: 20 },
  guardTitle:  { fontSize: 24, fontWeight: '600', color: '#1D1D1F', marginBottom: 8 },
  guardBody:   { fontSize: 17, color: '#86868B', textAlign: 'center', marginBottom: 24 },
});