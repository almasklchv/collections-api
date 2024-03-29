import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ItemsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prismaService: PrismaService) {}

  @SubscribeMessage('getComments')
  async handleGetComments(
    @MessageBody() data: { itemId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const comments = await this.prismaService.comment.findMany({
      where: {
        itemId: data.itemId,
      },
      include: {
        user: true,
      },
    });
    client.emit('getComments', comments);
  }

  @SubscribeMessage('createComment')
  async handleCreateComment(
    @MessageBody() data: { itemId: string; userId: string; text: string },
  ) {
    const comment = await this.prismaService.comment.create({
      data: {
        itemId: data.itemId,
        userId: data.userId,
        text: data.text,
      },
      include: {
        user: true,
      },
    });
    this.server.emit('commentCreated', comment);
  }

  @SubscribeMessage('deleteComment')
  async handleDeleteComment(
    @MessageBody() data: { commentId: string; userId: string; itemId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const comment = await this.prismaService.comment.findUnique({
      where: {
        id: data.commentId,
      },
    });

    if (!comment) {
      client.emit('error', { message: 'Comment not found' });
      return;
    }

    if (comment.userId !== data.userId) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: data.userId,
        },
      });

      if (!user || (user.role !== 'ADMIN' && comment.userId !== user.id)) {
        client.emit('error', {
          message: 'You do not have permission to delete this comment',
        });
        return;
      }
    }

    await this.prismaService.comment.delete({
      where: {
        id: data.commentId,
      },
    });

    client.emit('commentDeleted', { commentId: data.commentId });
    const updatedComments = await this.prismaService.comment.findMany({
      where: {
        itemId: data.itemId,
      },
      include: {
        user: true,
      },
    });

    this.server.emit('commentsUpdated', updatedComments);
  }

  @SubscribeMessage('toggleLike')
  async handleToggleLike(
    @MessageBody() data: { itemId: string; userId: string },
  ) {
    const like = await this.prismaService.like.findFirst({
      where: {
        AND: [{ itemId: data.itemId }, { userId: data.userId }],
      },
    });

    if (like) {
      await this.prismaService.like.delete({
        where: {
          id: like.id,
        },
      });
    } else {
      await this.prismaService.like.create({
        data: {
          itemId: data.itemId,
          userId: data.userId,
        },
      });
    }

    const updatedLikes = await this.prismaService.like.count({
      where: {
        itemId: data.itemId,
      },
    });

    this.server.emit('likesUpdated', {
      itemId: data.itemId,
      count: updatedLikes,
    });
  }

  @SubscribeMessage('getLikesCount')
  async handleGetLikesCount(
    @MessageBody() data: { itemId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const likes = await this.prismaService.like.count({
      where: {
        itemId: data.itemId,
      },
    });

    client.emit('getLikesCount', {
      count: likes,
    });
  }
}
