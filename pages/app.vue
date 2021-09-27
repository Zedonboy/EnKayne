<template>
  <main class="min-h-screen relative flex justify-center bg-gray-100">
    <div class="absolute top-0">
      <div
        v-show="!connected"
        class="
          w-full
          flex
          justify-center
          p-3
          font-bold
          text-yellow-500
          bg-yellow-50
        "
      >
        Connecting
      </div>
      <div
        v-show="connected && showSuccess"
        class="
          w-full
          flex
          justify-center
          p-3
          font-bold
          text-green-500
          bg-green-50
        "
      >
        Connecting
      </div>
      <tools
        @redo="redo"
        @toolSelected="toolSelected"
        @micToggled="micToggled"
        @undo="undo"
        @speakerToggled="speakerToggled"
      />
    </div>
    <section class="w-full h-screen flex">
      <aside class="w-0 md:w-2/12 flex p-8 flex-col h-full">
        <button
          @click="copyChannelLink"
          class="
            mt-8
            px-4
            p-1
            border-2
            rounded
            border-purple-600
            text-purple-600 text-sm
          "
        >
          Copy Link
        </button>
      </aside>
      <section class="w-10/12">
        <canvas id="whiteboard" class="w-full h-full"> </canvas>
      </section>
    </section>
  </main>
</template>
  <script lang="ts">
//@ts-nocheck
import {
  createBoard,
  DrawingModes,
  IBoardEngine,
  IChannel,
} from "../package/nkn-whiteboard";
import Tools from "../components/Tools.vue";
export default {
  components: {
    Tools,
  },

  data() {
    return {
      boardEngine: createBoard(),
      channel: null,
      connected: false,
      showSuccess: true,
    };
  },

  methods: {
    copyChannelLink() {
      let chName = this.boardEngine.getChannelName();
      navigator.clipboard
        .writeText(window.location.hostname + `/join?channel=${chName}`)
        .then((e) => {
          alert("Copied");
        });
    },

    undo() {
      this.boardEngine.boardUndo();
    },

    startChannel() {
      this.boardEngine.startChannel("test");
    },

    joinChannel() {
      this.boardEngine.joinChannel("test");
    },

    sendMessage() {
      this.boardEngine.sendMessage();
    },

    toolSelected(tool: string) {
      console.log(tool);
      switch (tool) {
        case "free_hand":
          this.boardEngine.setDrawMode(DrawingModes.FREE_HAND);
          break;
        case "text":
          this.boardEngine.setDrawMode(DrawingModes.TEXT);
          break;
        case "eraser":
          this.boardEngine.setDrawMode(DrawingModes.ERASER);
          break;
        case "circle_shape":
          this.boardEngine.setDrawMode(DrawingModes.CIRCLE_SHAPE);
          break;
        case "rect_shape":
          this.boardEngine.setDrawMode(DrawingModes.RECT_SHAPE);
          break;
      }
    },
    redo() {
      this.boardEngine.boardRedo();
    },

    micToggled(state: boolean) {
      if (state) {
        this.boardEngine.unMuteMic();
      } else {
        this.boardEngine.muteMic();
      }
    },

    speakerToggled(state: boolean) {
      if (state) {
        this.boardEngine.unMuteSpeaker();
      } else {
        this.boardEngine.muteSpeaker();
      }
    },
  },
  mounted() {
    this.boardEngine.initCanvas("whiteboard", true);
    let url = window.location.href;
    let urlObj = new URL(url);
    let mode = urlObj.searchParams.get("mode");
    if (mode && mode === "join") {
      let chName = urlObj.searchParams.get("channel");
      if (chName) {
        this.channel = this.boardEngine.joinChannel(chName);
        this.channel.listenTo("connected", () => {
          this.connected = true;
          setTimeout(() => {
            this.showSuccess = false;
          }, 2000);
        });
      }
    } else {
      this.channel = this.boardEngine.startChannel() as IChannel;
      this.channel.listenTo("connected", () => {
        this.connected = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, 2000);
      });
    }
  },
};
</script>