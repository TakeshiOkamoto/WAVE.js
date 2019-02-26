/***********************************************/
/*                                             */
/*   WAVE.js                                   */
/*                                      v1.00  */
/*                                             */
/*   Copyright 2019 Takeshi Okamoto (Japan)    */
/*                                             */
/*   Released under the MIT license            */
/*   https://github.com/TakeshiOkamoto         */
/*                                             */
/*                            Date: 2019-02-26 */
/***********************************************/
/*

  *** SPECIFICATION ***
  
  It corresponds to general Wave file.
  ( 一般的なWaveファイルに対応しています。 )
  
  --- Read
   unsigned 8bit [PCM]
   Signed 16bit  [PCM]
   Signed 24bit  [PCM]
   Signed 32bit  [PCM]
   32bit float   [IEEE Float]
    
  --- Write
   unsigned 8bit [PCM]
   Signed 16bit  [PCM]
   Signed 24bit  [PCM]
   Signed 32bit  [PCM]
  
  
  --- Not supported.
  Wave Format Extensible (WAVEX) is not supported.
  ( WAVEXは未対応です。必要であれば各自で対応して下さい。 )   

*/

////////////////////////////////////////////////////////////////////////////////
// Generic function
////////////////////////////////////////////////////////////////////////////////

// Byte Order 
function WAV_Byte2Word(PByteArray){   
  return (PByteArray[1] << 8 | PByteArray[0]);
}

function WAV_Byte2DWord(PByteArray){  
  return (PByteArray[3] << 24 | PByteArray[2] << 16 | PByteArray[1] << 8 |  PByteArray[0]) ;
}

// Uint8からInt8へ 
function WAV_SetInt8(x){
 if(128 == x) return 0;
 
 if(129 >= x){
   return x -128; 
 }else{
    return -(128 - x);
 }
}

// Int8からUint8へ
function WAV_SetUint8(x){
 if(0 == x) return 128;  
 
 if(1 >= x){
   return x + 128; 
 }else{
    return 128 + x;
 }
}

// Uint16からInt16へ 
// ※0 ～ 65535 から -32768 ～ 32767へ
function WAV_SetInt16(x){
 if(32768 <= x){
   return  -(65536 - x); 
 }else{
    return x;
 }
}

// Int16からUint16へ
// ※-32768 ～ 32767 から 0 ～ 65535へ 
function WAV_SetUint16(x){
 if(0 <= x && 32767 >= x){
   return x; 
 }else{
   return 65536 + x;
 }
} 

// Uint24からInt24へ 
// ※0 ～ 16777215 から -8388608 ～ 8388607へ
function WAV_SetInt24(x){
 if(8388608 <= x){
   return  -(16777216 - x); 
 }else{
    return x;
 }
}

// Int24からUint24へ
// ※-8388608 ～ 8388607 から 0 ～ 16777215へ 
function WAV_SetUint24(x){
 if(0 <= x && 8388607 >= x){
   return x; 
 }else{
   return 16777216 + x;
 }
} 

// Uint32からInt32へ 
// ※0 ～ 4294967296 から -2147483648 ～ 2147483647へ
function WAV_SetInt32(x){
 if(2147483648 <= x){
   return  -(4294967296 - x); 
 }else{
    return x;
 }
}

// Int32からUint32へ
// ※-2147483648 ～ 2147483647 から 0 ～ 4294967296へ 
function WAV_SetUint32(x){
 if(0 <= x && 2147483647 >= x){
   return x; 
 }else{
   return 4294967296 + x;
 }
} 

////////////////////////////////////////////////////////////////////////////////
// Generic class
////////////////////////////////////////////////////////////////////////////////

// ---------------------
//  TReadStream            
// ---------------------
function TReadStream(AStream) {
  this.Pos = 0;
  this.Stream = AStream;
  this.FileSize = AStream.length;
}

// ---------------------
//  TReadStream.Method     
// ---------------------
TReadStream.prototype = {

  Read: function (ReadByteCount) {
    var P = this.Stream.subarray(this.Pos, this.Pos + ReadByteCount);
    this.Pos = this.Pos + ReadByteCount;
    return P;
  },

  ReadString: function (ReadByteCount) {
    var P = String.fromCharCode.apply(
             null, this.Stream.subarray(this.Pos, this.Pos + ReadByteCount));
    this.Pos = this.Pos + ReadByteCount;
    return P;
  }
}

// ---------------------
//  TFileStream            
// ---------------------
function TFileStream(BufferSize) {

  if (BufferSize == undefined)
    this.MemorySize = 50000000; // 50M
  else
    this.MemorySize = parseInt(BufferSize, 10);

  this.Size = 0;
  this.Stream = new Uint8Array(this.MemorySize);
}

// ---------------------
//  TFileStream.Method     
// ---------------------
TFileStream.prototype = {

  _AsciiToUint8Array: function (S) {
    var len = S.length;
    var P = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      P[i] = S[i].charCodeAt(0);
    }
    return P;
  },

  WriteByte: function (value) {
    var P = new Uint8Array(1);
    
    P[0] = value;
    
    this.WriteStream(P);      
  },
    
  WriteWord: function (value) {
    var P = new Uint8Array(2);
    
    P[1] = (value & 0xFF00) >> 8;
    P[0] = (value & 0x00FF);  
    
    this.WriteStream(P);      
  },

  WriteDWord: function (value) {
    var P = new Uint8Array(4);
    
    P[3] = (value & 0xFF000000) >> 24;
    P[2] = (value & 0x00FF0000) >> 16;
    P[1] = (value & 0x0000FF00) >> 8;
    P[0] = (value & 0x000000FF);  
    
    this.WriteStream(P);      
  },
    
  WriteWord_Big: function (value) {
    var P = new Uint8Array(2);
    
    P[1] = (value & 0x00FF);
    P[0] = (value & 0xFF00) >> 8;  
    
    this.WriteStream(P);      
  },        
  
  WriteDWord_Big: function (value) {
    var P = new Uint8Array(4);
    
    P[3] = (value & 0x000000FF) 
    P[2] = (value & 0x0000FF00) >> 8;
    P[1] = (value & 0x00FF0000) >> 16;
    P[0] = (value & 0xFF000000) >> 24;  
    
    this.WriteStream(P);      
  },
      
  WriteString: function (S) {
    var P = this._AsciiToUint8Array(S);

    // メモリの再編成
    if (this.Stream.length <= (this.Size + P.length)) {
      var B = new Uint8Array(this.Stream);
      this.Stream = new Uint8Array(this.Size + P.length + this.MemorySize);
      this.Stream.set(B.subarray(0, B.length));
    }

    this.Stream.set(P, this.Size);
    this.Size = this.Size + P.length;
  },

  WriteStream: function (AStream) {      
      
    // メモリの再編成
    if (this.Stream.length <= (this.Size + AStream.length)) {
      var B = new Uint8Array(this.Stream);
      this.Stream = new Uint8Array(this.Size + AStream.length + this.MemorySize);
      this.Stream.set(B.subarray(0, B.length));
    }

    this.Stream.set(AStream, this.Size);
    this.Size = this.Size + AStream.length;
  },

  getFileSize: function () {
    return this.Size;
  },

  SaveToFile: function (FileName,type) {
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(new Blob([this.Stream.subarray(0, this.Size)], { type: type }), FileName);
    } else {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([this.Stream.subarray(0, this.Size)], { type: type }));
      //a.target   = '_blank';
      a.download = FileName;
      document.body.appendChild(a); //  FF specification
      a.click();
      document.body.removeChild(a); //  FF specification
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Wave class
////////////////////////////////////////////////////////////////////////////////

// ---------------------
//  TWaveAnalyst            
// ---------------------
function TWaveAnalyst(PByteArray) {
  
  var errormsg = "It is not a WAVE file.";
  var stream =  new TReadStream(PByteArray);

  // RIFF
  var magic = stream.ReadString(4); 
  if(magic != "RIFF"){
    throw errormsg;
  }
  stream.Read(4);

  // WAVE
  magic = stream.ReadString(4); 
  if(magic != "WAVE"){
    throw errormsg;
  }   

  // fmt
  var len, WaveFomat = {};  
  while(true){
    magic = stream.ReadString(4); 
    if(magic == "fmt "){
      len = WAV_Byte2DWord(stream.Read(4));          
      
      // 種類(1:リニアPCM)
      WaveFomat.wFormatTag = WAV_Byte2Word(stream.Read(2)); 
      // チャンネル数(1:モノラル 2:ステレオ)     
      WaveFomat.nChannels = WAV_Byte2Word(stream.Read(2));
      // サンプリングレート(44100=44.1kHzなど)      
      WaveFomat.nSamplesPerSec = WAV_Byte2DWord(stream.Read(4));  
      // 平均データ転送レート(byte/sec) 
      // ※PCMの場合はnSamplesPerSec * nBlockAlign          
      WaveFomat.nAvgBytesPerSec = WAV_Byte2DWord(stream.Read(4));  
      // ブロックサイズ 
      // ※PCMの場合はwBitsPerSample * nChannels / 8 
      WaveFomat.nBlockAlign = WAV_Byte2Word(stream.Read(2)); 
      // サンプルあたりのビット数 (bit/sample) 
      // ※PCMの場合は8bit=8, 16bit =16    
      WaveFomat.wBitsPerSample = WAV_Byte2Word(stream.Read(2));  
      
      // WaveFomatExなどの対策
      stream.Pos = stream.Pos + len - 16;
      
      break;
    }else{
      len = WAV_Byte2DWord(stream.Read(4));
      stream.Pos += len;
    }  

    if (stream.Pos >= stream.FileSize){
      throw errormsg;
    }
  }

  // data
  var raw;
  while(true){
    magic = stream.ReadString(4); 
    if(magic == "data"){
      len = WAV_Byte2DWord(stream.Read(4));
      raw = stream.Stream.subarray(stream.Pos,stream.Pos + len);
      
      break;
    }else{
      var len = WAV_Byte2DWord(stream.Read(4));
      stream.Pos += len;
    }  
    
    if (stream.Pos >= stream.FileSize){
      throw errormsg;
    }
  }

  // WaveFomat構造体(アクセス用)
  this.WaveFomat = WaveFomat; 
  // 波形データ
  this.raw = raw;
  // 再生時間 (ms)
  this.time = 1000 * len / WaveFomat.nAvgBytesPerSec; 
  // ビットレート (bps)
  this.bps = WaveFomat.nSamplesPerSec * WaveFomat.wBitsPerSample * WaveFomat.nChannels;     
}

// ---------------------
//  TWaveFormat            
// ---------------------
function TWaveFormat(PByteArray) {
  
  // ファイルの解析
  try{
    this.Analyst = new TWaveAnalyst(PByteArray);
  }catch(e){
    throw(e);
  }  
}

// ---------------------
//  TWaveFormat.Method     
// ---------------------
TWaveFormat.prototype = {
  
  // 波形データを取得する
  getData: function () {
    
    // PCM(8/16/24/32bit)及びIEEE Float(32bit)のみ対応
    if(!(this.Analyst.WaveFomat.wFormatTag == 1 || 
        (this.Analyst.WaveFomat.wFormatTag == 3 && this.Analyst.WaveFomat.wBitsPerSample == 32))){
      throw 'It is an unsupported format.'; 
    }
    
    var index, data = {};
    data.L = [];  data.R = [] ;
    switch (this.Analyst.WaveFomat.wBitsPerSample){
      
      // 8bit 0 ～ 255、無音は128
      case 8 : 
            // モノラル
            if(this.Analyst.WaveFomat.nChannels == 1){
              for(var i=0;i<this.Analyst.raw.length;i++){
                data.L.push(this.Analyst.raw[i]);
              }              
              // 符号なしから符号ありに変換 
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt8(data.L[i]); 
              }                      
            // ステレオ  
            }else{
              for(var i=0;i<this.Analyst.raw.length;i++){
                if(i % 2 == 0){           
                  data.L.push(this.Analyst.raw[i]);
                }else{
                  data.R.push(this.Analyst.raw[i]);
                }
              }
              // 符号なしから符号ありに変換 
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt8(data.L[i]); 
                data.R[i] = WAV_SetInt8(data.R[i]); 
              }                         
            }
            break;

      // 16bit -32768 ～ +32767、無音は0
      case 16 : 
            if(this.Analyst.WaveFomat.nChannels == 1){
              for(var i=0;i<this.Analyst.raw.length/2;i++){   
                index = i * 2;                    
                data.L.push((this.Analyst.raw[index+1] << 8) | this.Analyst.raw[index]);
              }              
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt16(data.L[i]); 
              }                                      
            }else{
              for(var i=0;i<this.Analyst.raw.length/2;i++){
                index = i * 2; 
                if(i % 2 == 0){           
                  data.L.push((this.Analyst.raw[index+1] << 8) | this.Analyst.raw[index]);
                }else{
                  data.R.push((this.Analyst.raw[index+1] << 8) | this.Analyst.raw[index]);
                }
              }
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt16(data.L[i]);
                data.R[i] = WAV_SetInt16(data.R[i]);     
              }               
            }
            break;

      // 24bit -8388608 ～ 8388607、無音は0
      case 24 : 
            if(this.Analyst.WaveFomat.nChannels == 1){
              for(var i=0;i<this.Analyst.raw.length/3;i++){   
                index = i * 3;                    
                data.L.push( this.Analyst.raw[index]          |
                            (this.Analyst.raw[index+1] << 8 ) |
                            (this.Analyst.raw[index+2] << 16)); 
              }              
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt24(data.L[i]); 
              }                   
            }else{
              for(var i=0;i<this.Analyst.raw.length/3;i++){
                index = i * 3; 
                if(i % 2 == 0){           
                  data.L.push( this.Analyst.raw[index]          |
                              (this.Analyst.raw[index+1] << 8)  |
                              (this.Analyst.raw[index+2] << 16)); 
                }else{
                  data.R.push( this.Analyst.raw[index]          |
                              (this.Analyst.raw[index+1] << 8)  |
                              (this.Analyst.raw[index+2] << 16));  
                }
              }  
              for(var i=0;i<data.L.length;i++){
                data.L[i] = WAV_SetInt24(data.L[i]);
                data.R[i] = WAV_SetInt24(data.R[i]);     
              }               
            }
            break;            
            
      
      case 32 :
            // [PCM] 32bit -2147483648 ～ 2147483647、無音は0
            if (this.Analyst.WaveFomat.wFormatTag == 1){    
              if(this.Analyst.WaveFomat.nChannels == 1){  
                for(var i=0;i<this.Analyst.raw.length/4;i++){
                  index = i * 4;       
                  data.L.push( this.Analyst.raw[index]          |
                              (this.Analyst.raw[index+1] << 8 ) |
                              (this.Analyst.raw[index+2] << 16) |
                              (this.Analyst.raw[index+3] << 24) 
                        );
                }  
                for(var i=0;i<data.L.length;i++){
                  data.L[i] = WAV_SetInt32(data.L[i]);
                }                 
              }else{
                for(var i=0;i<this.Analyst.raw.length/4;i++){
                  index = i * 4; 
                  if(i % 2 == 0){           
                    data.L.push( this.Analyst.raw[index]          |
                                (this.Analyst.raw[index+1] << 8 ) |
                                (this.Analyst.raw[index+2] << 16) |
                                (this.Analyst.raw[index+3] << 24) 
                          );
                  }else{
                    data.R.push( this.Analyst.raw[index]          |
                                (this.Analyst.raw[index+1] << 8 ) |
                                (this.Analyst.raw[index+2] << 16) |
                                (this.Analyst.raw[index+3] << 24)   
                          );
                  }
                }  
                for(var i=0;i<data.L.length;i++){
                  data.L[i] = WAV_SetInt32(data.L[i]);
                  data.R[i] = WAV_SetInt32(data.R[i]);     
                }               
              }
              
            // [IEEE Float] 32bit -1 ～ 1、無音は0   
            }else{              
              var val, dataView = new DataView(new ArrayBuffer(4)); 
              
              if(this.Analyst.WaveFomat.nChannels == 1){                                           
                for(var i=0;i<this.Analyst.raw.length/4;i++){                  
                  index = i * 4; 
                  dataView.setUint32(0,
                                     this.Analyst.raw[index]          |
                                    (this.Analyst.raw[index+1] << 8 ) |
                                    (this.Analyst.raw[index+2] << 16) |
                                    (this.Analyst.raw[index+3] << 24), false);
                                    
                  val = dataView.getFloat32(0);
                  if(val >= 0){
                    val = val * 2147483647;                      
                  }else{
                    val = val * 2147483648;
                  }
                  data.L.push(val);
                }
                for(var i=0;i<data.L.length;i++){
                  data.L[i] = WAV_SetInt32(data.L[i]);
                }  
              }else{           
                for(var i=0;i<this.Analyst.raw.length/4;i++){
                  index = i * 4; 
                  if(i % 2 == 0){  
                    dataView.setUint32(0,
                                       this.Analyst.raw[index]          |
                                      (this.Analyst.raw[index+1] << 8 ) |
                                      (this.Analyst.raw[index+2] << 16) |
                                      (this.Analyst.raw[index+3] << 24), false);
                                      
                    val = dataView.getFloat32(0);
                    if(val >= 0){
                      val = val * 2147483647;                      
                    }else{
                      val = val * 2147483648;
                    }
                    data.L.push(val);
                  }else{
                    dataView.setUint32(0,
                                       this.Analyst.raw[index]          |
                                      (this.Analyst.raw[index+1] << 8 ) |
                                      (this.Analyst.raw[index+2] << 16) |
                                      (this.Analyst.raw[index+3] << 24), false);
                                      
                    val = dataView.getFloat32(0);
                    if(val >= 0){
                      val = val * 2147483647;                      
                    }else{
                      val = val * 2147483648;
                    }
                    data.R.push(val);
                  }                  
                }                
                for(var i=0;i<data.L.length;i++){
                  data.L[i] = WAV_SetInt32(data.L[i]);
                  data.R[i] = WAV_SetInt32(data.R[i]);     
                }                                  
              }
            }
            break;  
            
      default : throw 'It is an unsupported format.';                
    }
    return data;
  },
  
  // Waveファイルの生成
  WriteStream: function (bits, data, frequency) {  
        
    // フォーマットの変更      
    var WaveFomat ={};
    
    WaveFomat.wFormatTag = 1;    
    WaveFomat.wBitsPerSample = bits;      
    WaveFomat.nSamplesPerSec = frequency;
    
    if(data.R.length == 0){
      WaveFomat.nChannels = 1;
    }else{
      WaveFomat.nChannels = 2;
    }    
    
    WaveFomat.nBlockAlign = WaveFomat.wBitsPerSample * WaveFomat.nChannels / 8;
    WaveFomat.nAvgBytesPerSec = WaveFomat.nSamplesPerSec * WaveFomat.nBlockAlign; 
          
    var F = new TFileStream();  
          
    // RIFFヘッダ     
    F.WriteString("RIFF");
     
    // ファイルの全体サイズ
    // ※波形データのサイズ + 36byteのヘッダ情報
    F.WriteDWord((data.L.length + data.R.length) * (bits/ 8) + 36);

    // RIFFの種類(WAVE)
    F.WriteString("WAVE");
   
      // fmtチャンク
      F.WriteString("fmt ");
      
      // チャンクのバイト数
      F.WriteDWord(16);     
                    
      // 種類(1:リニアPCM)
      F.WriteWord(WaveFomat.wFormatTag);
      // チャンネル数(1:モノラル 2:ステレオ)   
      F.WriteWord(WaveFomat.nChannels);
      // サンプリングレート(44100=44.1kHzなど)
      F.WriteDWord(WaveFomat.nSamplesPerSec);
      // 平均データ転送レート(byte/sec) 
      // ※PCMの場合はnSamplesPerSec * nBlockAlign        
      F.WriteDWord(WaveFomat.nAvgBytesPerSec);
      // ブロックサイズ 
      // ※PCMの場合はwBitsPerSample * nChannels / 8         
      F.WriteWord(WaveFomat.nBlockAlign);
      // サンプルあたりのビット数 (bit/sample) 
      // ※PCMの場合は8bit=8, 16bit =16           
      F.WriteWord(WaveFomat.wBitsPerSample);

      // dataチャンク
      F.WriteString("data");
      
      // 波形データのバイト数    
      F.WriteDWord((data.L.length + data.R.length) * (bits/ 8));

      // 波形データ
      if(bits == 8){
        if(data.R.length == 0){
          for (var i=0;i< data.L.length; i++){
            F.WriteByte(data.L[i]);      
          }     
        }else{
          for (var i=0;i< data.L.length; i++){
            F.WriteByte(data.L[i]);      
            F.WriteByte(data.R[i]);      
          }     
        }        
      }else if(bits == 16){
        if(data.R.length == 0){
          for (var i=0;i< data.L.length; i++){
            F.WriteWord(data.L[i]);      
          }              
        }else{        
          for (var i=0;i< data.L.length; i++){
            F.WriteWord(data.L[i]);      
            F.WriteWord(data.R[i]);      
          }     
        }  
      }else if(bits == 24){
        if(data.R.length == 0){
          for (var i=0;i< data.L.length; i++){
            F.WriteByte((data.L[i] & 0x0000FF) );  
            F.WriteByte((data.L[i] & 0x00FF00) >> 8);  
            F.WriteByte((data.L[i] & 0xFF0000) >>16);      
          }              
        }else{        
          for (var i=0;i< data.L.length; i++){
            F.WriteByte((data.L[i] & 0x0000FF) );  
            F.WriteByte((data.L[i] & 0x00FF00) >> 8);  
            F.WriteByte((data.L[i] & 0xFF0000) >>16);  
            
            F.WriteByte((data.R[i] & 0x0000FF) );  
            F.WriteByte((data.R[i] & 0x00FF00) >> 8);  
            F.WriteByte((data.R[i] & 0xFF0000) >>16); 
          }     
        }            
      }else if(bits == 32){
        if(data.R.length == 0){
          for (var i=0;i< data.L.length; i++){
            F.WriteDWord(data.L[i]);      
          }            
        }else{                
          for (var i=0;i< data.L.length; i++){
            F.WriteDWord(data.L[i]);      
            F.WriteDWord(data.R[i]);      
          }  
        }
      }

      return F;
  },
  
  // ---------------------------------------------------------
  //  bits           : 8/16/24/32(bit) 
  //  stereo         : stereo is true, monaural is false
  //  frequency      : sampling frequency(Hz)
  //  rawflg         : true is return Uint8Array 
  SaveToStream: function (bits, stereo, frequency, rawflg) {
    
    // --------------------------     
    //  波形データの取得
    // --------------------------     
    var data = this.getData();     
    
    // --------------------------     
    //  ステレオ/モノラル
    // --------------------------     
    if(stereo){
      // Copy
      if (data.R.length == 0){
        data.R = data.L.slice(0);
      }      
    }else{
      // Delete
      data.R = [];
    }    
    
    // --------------------------    
    //  リサンプリング
    //  (サンプリング周波数変換)
    // --------------------------  
    if(frequency != this.Analyst.WaveFomat.nSamplesPerSec){
      // 比率
      var ratio =  this.Analyst.WaveFomat.nSamplesPerSec / frequency;  
      // 1チャンネルのサイズ ( bps / bits )
      var size = (frequency * (bits * 1) * this.Analyst.time / 1000) / bits;   
          
      var tmpL = new Array(Math.floor(size));
      var index = 0;          
      for (var i=0;i< tmpL.length; i++){
         index += ratio;
         tmpL[i] = data.L[Math.floor(index)];
      }
      data.L = tmpL;

      if (data.R.length != 0){
        var tmpR = new Array(tmpL.length); 
        index = 0                                 
        for (var i=0;i< tmpL.length; i++){
           index += ratio;
           tmpR[i] = data.R[Math.floor(index)];       
        }
        data.R = tmpR;          
      }      
    }
    
    // --------------------------   
    //  ビット数の変更
    // --------------------------   
            
    // 8bit
    if(bits == 8){
      if(this.Analyst.WaveFomat.wBitsPerSample == 8){
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 16){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
            data.R[i] = data.R[i] >> 8;
          }
        }            
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 24){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 16;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 16;
            data.R[i] = data.R[i] >> 16;
          }
        }          
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 32){  
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 24;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 24;
            data.R[i] = data.R[i] >> 24;
          }
        }          
      }
      
      // 符号ありから符号なしに変換 
      if(data.R.length == 0){ 
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint8(data.L[i]);
        }         
      }else{
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint8(data.L[i]);
          data.R[i] = WAV_SetUint8(data.R[i]);     
        }    
      }
      
    // 16bit      
    }else if(bits == 16){
      if(this.Analyst.WaveFomat.wBitsPerSample == 8){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
          }             
        }else{
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
            data.R[i] = data.R[i] << 8;
          }
        }
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 16){
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 24){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
            data.R[i] = data.R[i] >> 8;
          }
        }          
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 32){  
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 16;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 16;
            data.R[i] = data.R[i] >> 16;
          }
        }          
      }
   
      // 符号ありから符号なしに変換 
      if(data.R.length == 0){ 
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint16(data.L[i]);
        }         
      }else{
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint16(data.L[i]);
          data.R[i] = WAV_SetUint16(data.R[i]);     
        }    
      }    

    // 24bit         
    }else if(bits == 24){
      if(this.Analyst.WaveFomat.wBitsPerSample == 8){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 16;
          }             
        }else{
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 16;
            data.R[i] = data.R[i] << 16;
          }
        }
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 16){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
            data.R[i] = data.R[i] << 8;
          }
        }          
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 24){      
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 32){  
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] >> 8;
            data.R[i] = data.R[i] >> 8;
          }
        }          
      }
      
      // 符号ありから符号なしに変換 
      if(data.R.length == 0){ 
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint24(data.L[i]);
        }         
      }else{
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint24(data.L[i]);
          data.R[i] = WAV_SetUint24(data.R[i]);     
        }    
      } 
    
    // 32bit           
    }else if(bits == 32){
      if(this.Analyst.WaveFomat.wBitsPerSample == 8){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 24;
          }             
        }else{
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 24;
            data.R[i] = data.R[i] << 24;
          }
        }
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 16){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 16;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 16;
            data.R[i] = data.R[i] << 16;
          }
        }
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 24){
        if(data.R.length == 0){ 
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
          }        
        }else{      
          for (var i=0;i< data.L.length; i++){
            data.L[i] = data.L[i] << 8;
            data.R[i] = data.R[i] << 8;
          }
        }      
      }else if(this.Analyst.WaveFomat.wBitsPerSample == 32){      
      }
      
      // 符号ありから符号なしに変換   
      if(data.R.length == 0){ 
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint32(data.L[i]);
        }      
      }else{
        for(var i=0;i<data.L.length;i++){
          data.L[i] = WAV_SetUint32(data.L[i]);
          data.R[i] = WAV_SetUint32(data.R[i]);     
        }      
      }    
    }       
    
    var F = this.WriteStream(bits, data, frequency);
    if(rawflg){
      return new Uint8Array(F.Stream.subarray(0, F.getFileSize()));
    }else{
      return F;
    }    
  },    

  // ---------------------------------------------------------
  //  bits           : 8/16/24/32(bit) 
  //  stereo         : stereo is true, monaural is false
  //  frequency      : sampling frequency(Hz)
  SaveToFile: function (filename, bits, stereo, frequency) {    
    var F = this.SaveToStream(bits, stereo, frequency, false);
    F.SaveToFile(filename, "audio/wav");    
  },  
  
  // ---------------------------------------------------------  
  //  Bonus (おまけ)
  //
  //  canvas1 : L or Mono
  //  canvas2 : R
  //
  //  This method can not be called in Web Worker.
  //  ( このメソッドはWeb Workerでは呼び出せません。 )
  drawCanvas: function (canvas1, canvas2) {    
        
    // 正規化
    // 値を0から最大値までにする   
    // x : 対象の値 max : 最大値
    function Normalization(x, max){

      if(x == 0) return 0;

      var one;
      if(0 <= x){
        one = 32767 / max;
        return x / one;
      }else{
        one = 32768 / max;
        return Math.abs(x) / one;
      }      
    }  
    
    // Canvasへ描画
    function draw(canvas, data, text, mySelf){
      var height = canvas.height;
      var half = Math.floor(height / 2);
      
      var ctx = canvas.getContext("2d"); 
      
      // Canvasの「横1px」のサンプル数
      var one_width_samples = Math.floor(data.length / canvas.width);
     
      // Canvasの「横1px」の最大値、最小値
      var max_list =[],min_list =[]; 
      for(var i=0;i<(data.length / one_width_samples) - 1;i++){
         var pos = i * one_width_samples;
         
         // Canvasの「横1px」のサンプル数の配列の切り出し
         var lst = data.slice(pos,pos + one_width_samples);      
        
         // 最大/最小
         var max = lst.reduce(function(x, y) {
                               if (x > y) return x;
                               return y;
                             });
         var min = lst.reduce(function(x, y) {
                               if (x > y) return y;
                               return x;
                             });
         // 値の正規化  
         max_list.push(Normalization(max,half));
         min_list.push(Normalization(min,half+1));
      }
    
      ctx.fillStyle = "silver";
      ctx.clearRect(0,0,canvas.width,canvas.height);       
       
      // 中央
      ctx.beginPath();
        ctx.moveTo(0, half);
        ctx.lineTo(canvas.width,half);
      ctx.stroke();
         
      ctx.beginPath();
        ctx.moveTo(canvas.width /2, 0);
        ctx.lineTo(canvas.width /2, canvas.height);
      ctx.stroke();
               
      // 波形データ 
      for(var i=0;i<max_list.length;i++){ 
        if(max_list[i] + min_list[i] == 0) continue;
        ctx.fillRect(i,half - max_list[i] ,1,max_list[i] + min_list[i])
      }   
       
      // テキストの描画
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.font  = '18px "Times New Roman"';     
      
      ctx.fillText(text, 5, 20);
       
      ctx.fillText('0s', 3, height-10);
       
      var mid_str = Math.round(mySelf.Analyst.time/1000/2*1000)/1000+ 's';
      var mid_margin = mid_str.length * 3.5;   
      ctx.fillText(mid_str, canvas.width /2 - mid_margin, height-10);
       
      var last_str =Math.round(mySelf.Analyst.time) /1000+ 's';
      var last_margin = last_str.length * 9;
      ctx.fillText(last_str, canvas.width - last_margin, height-10);
    }    

    // 16bit only :-)
    var mySelf = this;
    if(this.Analyst.WaveFomat.wBitsPerSample != 16){      
      var stereo; 
      if (this.Analyst.WaveFomat.nChannels == 1){
        stereo = false;
      }else{  
        stereo = true;
      }

      var file = this.SaveToStream(16, stereo, this.Analyst.WaveFomat.nSamplesPerSec, true);
      mySelf = new TWaveFormat(file);         
    }         
    
    var data = mySelf.getData();     
    if(mySelf.Analyst.WaveFomat.nChannels == 1){      
      draw(canvas1, data.L, "[ Mono ]", mySelf);      
    }else{
      draw(canvas1, data.L, "[ L ]", mySelf);
      draw(canvas2, data.R, "[ R ]", mySelf);
    }
  }    
}
